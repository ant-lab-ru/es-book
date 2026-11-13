# Задание 3.3.5: снимает осциллограмму линии GP0 (передатчик UART0) через АЦП на GP26
# на 115 200 и 9600 бит/с, пробует неверные аргументы и рисует график.
# Провода GP0 — GP9, GP8 — GP1 и GP0 — GP26 стоят весь прогон.
# Обмен записывается в файл device-3-3-5.log, график — в scope-3-3-5.png.

import time
from datetime import datetime

import matplotlib.pyplot as plt
import serial
from serial.tools import list_ports

VENDOR_ID = 0x2E8A
PRODUCT_ID = 0x000A

TASK = "3.3.5"
PROJECT = "331-uart"
LOG_NAME = "device-3-3-5.log"
PLOT_NAME = "scope-3-3-5.png"
BACKSPACE = "\x7f"
# опорное напряжение и число уровней 12-разрядного АЦП
ADC_VREF_V = 3.3
ADC_LEVELS = 4096
# сколько микросекунд линии показать на графике
WINDOW_US = {115200: 200, 9600: 1300}
# Кадр команды и сколько секунд слушать ответ.
STEPS = [
    ("\r", 0.5),
    ("help\r", 1),
    ("info\r", 1),
    ("loop pins\r", 0.5),
    ("parity none none\r", 0.5),
    ("baud_shift 0\r", 0.5),
    ("scope 115200 U\r", 2),
    ("scope 9600 U\r", 2),
    ("scope 1200 U\r", 0.5),
    ("scope 9600 ABCDE\r", 0.5),
    ("scope\r", 0.5),
]


def find_board():
    for port in list_ports.comports():
        if port.vid == VENDOR_ID and port.pid == PRODUCT_ID:
            return port
    return None


def printable(text):
    return text.replace(BACKSPACE, "<BS>").replace("\b", "<BS>").replace("\r", "").replace("\n", "")


def is_samples(line):
    return line[:1].isdigit()


def talk(board):
    exchange = []
    with serial.Serial(board.device, timeout=0.05) as port:
        time.sleep(0.2)
        port.reset_input_buffer()
        started = time.monotonic()
        received = ""
        for frame, listen_s in STEPS:
            port.write(frame.encode("ascii"))
            exchange.append((time.monotonic() - started, "-->", printable(frame)))
            deadline = time.monotonic() + listen_s
            while time.monotonic() < deadline:
                received += port.read(4096).decode("ascii", "replace")
                while "\n" in received:
                    line, received = received.split("\n", 1)
                    line = printable(line).strip()
                    if line:
                        exchange.append((time.monotonic() - started, "<--", line))
                        if not is_samples(line):
                            print(line, end="\r\n")
    return exchange


def write_log(board, exchange):
    with open(LOG_NAME, "w", encoding="utf-8") as log:
        log.write("задание: " + TASK + "\n")
        log.write("проект: " + PROJECT + "\n")
        log.write("устройство: %04x:%04x\n" % (board.vid, board.pid))
        log.write("серийный номер: " + str(board.serial_number) + "\n")
        log.write("порт: " + board.device + "\n")
        log.write("начало: " + datetime.now().isoformat(timespec="seconds") + "\n")
        for moment, direction, text in exchange:
            log.write("%8.3f %s %s\n" % (moment, direction, text))
        answers = len(exchange) - len(STEPS)
        log.write("итог: отправлено кадров %d, принято строк %d\n" % (len(STEPS), answers))


def scopes(exchange):
    # осциллограммы из ответов: скорость, частота отсчётов, отсчёты
    found = []
    current = None
    for _, direction, text in exchange:
        if direction != "<--":
            continue
        if text.startswith("scope:") and "samples" in text:
            words = text.replace(",", "").split()
            current = (int(words[5]), int(words[3]), [])
        elif text == "scope: end" and current is not None:
            found.append(current)
            current = None
        elif current is not None and is_samples(text):
            current[2].extend(int(code) for code in text.split())
    return found


def plot(found):
    fig, axes = plt.subplots(len(found), 1, figsize=(12, 3 * len(found)))
    for ax, (baud, rate, samples) in zip(axes, found):
        us = [i * 1e6 / rate for i in range(len(samples))]
        volts = [code * ADC_VREF_V / ADC_LEVELS for code in samples]
        ax.plot(us, volts, ".-", markersize=4, linewidth=0.8)
        ax.set_xlim(0, WINDOW_US.get(baud, us[-1]))
        ax.set_ylim(-0.2, ADC_VREF_V + 0.3)
        ax.set_ylabel("GP0, В")
        ax.set_title("%d бит/с, %d отсчётов в секунду" % (baud, rate))
        ax.grid(True, alpha=0.3)
    axes[-1].set_xlabel("время от начала захвата, мкс")
    fig.tight_layout()
    fig.savefig(PLOT_NAME, dpi=120)
    plt.show()


board = find_board()

if board is None:
    print("Плата не найдена. Проверьте кабель и запишите на плату прошивку прибора.", end="\r\n")
else:
    print("Плата на порту " + board.device + ", отправляю кадры", end="\r\n")
    exchange = talk(board)
    write_log(board, exchange)
    print("Обмен записан в " + LOG_NAME, end="\r\n")
    found = scopes(exchange)
    if len(found) >= 2:
        print("Осциллограммы записаны в " + PLOT_NAME, end="\r\n")
        plot(found)
    else:
        print("В ответах нет двух осциллограмм scope, график не построен.", end="\r\n")
