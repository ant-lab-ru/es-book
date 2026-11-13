# Задание 3.3.1: измеряет фронты линии RC-цепи в двухтактном режиме и в режиме
# открытого стока с внутренней подтяжкой, пробует неверные аргументы.
# Использование: python check-3-3-1.py <ёмкость, мкФ>
# Обмен и ёмкость записываются в файл device-3-3-1.log.

import sys
import time
from datetime import datetime

import serial
from serial.tools import list_ports

VENDOR_ID = 0x2E8A
PRODUCT_ID = 0x000A

TASK = "3.3.1"
PROJECT = "331-uart"
LOG_NAME = "device-3-3-1.log"
BACKSPACE = "\x7f"
# конденсаторы, с которыми фронты укладываются в замер задачи
CAPACITANCE_MIN_UF = 2.2
CAPACITANCE_MAX_UF = 10
# Кадр команды и сколько секунд слушать ответ.
STEPS = [
    ("\r", 0.5),
    ("help\r", 1),
    ("info\r", 1),
    ("edge pp\r", 3),
    ("edge od\r", 5),
    ("edge pp\r", 3),
    ("edge od\r", 5),
    ("edge xx\r", 0.5),
    ("edge\r", 0.5),
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


def capacitance_uf():
    try:
        value = float(sys.argv[1].replace(",", "."))
    except (IndexError, ValueError):
        value = 0
    if not CAPACITANCE_MIN_UF <= value <= CAPACITANCE_MAX_UF:
        print("Укажите ёмкость конденсатора в микрофарадах, от 2,2 до 10: python check-3-3-1.py 4.7", end="\r\n")
        sys.exit(1)
    return value


def write_log(board, capacitance, exchange):
    with open(LOG_NAME, "w", encoding="utf-8") as log:
        log.write("задание: " + TASK + "\n")
        log.write("проект: " + PROJECT + "\n")
        log.write("конденсатор, мкФ: %g\n" % capacitance)
        log.write("устройство: %04x:%04x\n" % (board.vid, board.pid))
        log.write("серийный номер: " + str(board.serial_number) + "\n")
        log.write("порт: " + board.device + "\n")
        log.write("начало: " + datetime.now().isoformat(timespec="seconds") + "\n")
        for moment, direction, text in exchange:
            log.write("%8.3f %s %s\n" % (moment, direction, text))
        answers = len(exchange) - len(STEPS)
        log.write("итог: отправлено кадров %d, принято строк %d\n" % (len(STEPS), answers))


capacitance = capacitance_uf()
board = find_board()

if board is None:
    print("Плата не найдена. Проверьте кабель и запишите на плату прошивку прибора.", end="\r\n")
else:
    print("Плата на порту " + board.device + ", отправляю кадры", end="\r\n")
    exchange = talk(board)
    write_log(board, capacitance, exchange)
    print("Обмен записан в " + LOG_NAME, end="\r\n")
