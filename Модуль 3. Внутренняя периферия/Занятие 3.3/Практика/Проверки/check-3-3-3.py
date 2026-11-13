# Задание 3.3.3: гоняет строки между UART0 и UART1 одной платы, смещает скорость
# UART1 и меняет чётность, пробует неверные аргументы.
# Провода GP0 — GP9 и GP8 — GP1 стоят весь прогон. Обмен записывается в файл device-3-3-3.log.

import time
from datetime import datetime

import serial
from serial.tools import list_ports

VENDOR_ID = 0x2E8A
PRODUCT_ID = 0x000A

TASK = "3.3.3"
PROJECT = "331-uart"
LOG_NAME = "device-3-3-3.log"
BACKSPACE = "\x7f"
# Кадр команды и сколько секунд слушать ответ.
STEPS = [
    ("\r", 0.5),
    ("help\r", 1),
    ("info\r", 1),
    ("loop pins\r", 0.5),
    ("parity none none\r", 0.5),
    ("baud_shift 0\r", 0.5),
    ("link ping\r", 0.5),
    ("text\r", 0.5),
    ("baud_shift 2\r", 0.5),
    ("text\r", 0.5),
    ("baud_shift -2\r", 0.5),
    ("text\r", 0.5),
    ("baud_shift -3\r", 0.5),
    ("text\r", 0.5),
    ("baud_shift -4\r", 0.5),
    ("text\r", 0.5),
    ("baud_shift -5\r", 0.5),
    ("text\r", 0.5),
    ("baud_shift -6\r", 0.5),
    ("text\r", 0.5),
    ("baud_shift 3\r", 0.5),
    ("text\r", 0.5),
    ("baud_shift 4\r", 0.5),
    ("text\r", 0.5),
    ("baud_shift 5\r", 0.5),
    ("text\r", 0.5),
    ("baud_shift 6\r", 0.5),
    ("text\r", 0.5),
    ("baud_shift -10\r", 0.5),
    ("text\r", 0.5),
    ("baud_shift 0\r", 0.5),
    ("parity even odd\r", 0.5),
    ("text\r", 0.5),
    ("parity none none\r", 0.5),
    ("text\r", 0.5),
    ("baud_shift 60\r", 0.5),
    ("parity even\r", 0.5),
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
