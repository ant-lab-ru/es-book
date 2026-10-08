# Приёмка прибора 231-firmware-template по техническому заданию занятия 2.3:
# отправляет плате кадры команд по приложениям А и Б и записывает обмен в файл device-2-3-8.log.

import time
from datetime import datetime

import serial
from serial.tools import list_ports

VENDOR_ID = 0x2E8A
PRODUCT_ID = 0x000A

TASK = "2.3.8"
PROJECT = "231-firmware-template"
LOG_NAME = "device-2-3-8.log"
BACKSPACE = "\x7f"
# Кадр, который отправляется плате как есть, и сколько секунд слушать ответ.
# Кадр без конца строки плата принимает, но не выполняет: его продолжение идёт следующим шагом.
STEPS = [
    ("\r", 0.5),
    ("help\r", 1),
    ("info\r", 1),
    ("uptime\r", 1),
    ("   uptime    \r", 1),
    ("upx" + BACKSPACE + "time\r", 1),
    ("x" * 70 + "\r", 1),
    ("led_period 1 2 3 4 5\r", 1),
    ("blink\r", 1),
    ("led_enable\r", 1),
    ("led_disable\r", 1),
    ("led_period 2000\r", 1),
    ("led_blink\r", 1),
    ("led_period\r", 1),
    ("led_period 5x\r", 1),
    ("led_period -1\r", 1),
    ("led_period 4294967296\r", 1),
    ("led_period 0\r", 1),
    ("led_period 1000\r", 1),
    ("button\r", 1),
    ("pi\r", 1),
    ("pi_start 0\r", 1),
    ("pi_start 5x\r", 1),
    ("pi_start 10 20\r", 1),
    ("profiling_reset\r", 1),
    ("pi_start\r", 0.5),
    ("pi\r", 0.5),
    ("pi_start 1000\r", 0.5),
    ("uptime\r", 0.5),
    ("p", 6),
    ("i\r", 1),
    ("profiling\r", 1),
    ("pi_start 100000\r", 1),
    ("pi\r", 1),
    ("profiling_reset\r", 1),
    ("profiling\r", 1),
]


def find_board():
    for port in list_ports.comports():
        if port.vid == VENDOR_ID and port.pid == PRODUCT_ID:
            return port
    return None


def printable(text):
    return text.replace(BACKSPACE, "<BS>").replace("\b", "<BS>").replace("\r", "").replace("\n", "")


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
                received += port.read(256).decode("ascii", "replace")
                while "\n" in received:
                    line, received = received.split("\n", 1)
                    line = printable(line).strip()
                    if line:
                        exchange.append((time.monotonic() - started, "<--", line))
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


board = find_board()

if board is None:
    print("Плата не найдена. Проверьте кабель и запишите на плату прошивку прибора.", end="\r\n")
else:
    print("Плата на порту " + board.device + ", отправляю кадры", end="\r\n")
    exchange = talk(board)
    write_log(board, exchange)
    print("Обмен записан в " + LOG_NAME, end="\r\n")
