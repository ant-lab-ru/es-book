# Проверка задания п2.1.1 на устройстве: посылает плате команды занятия
# и записывает обмен в файл device-2-1-1.log.

import time
from datetime import datetime

import serial
from serial.tools import list_ports

VENDOR_ID = 0x2E8A
PRODUCT_ID = 0x000A

TASK = "2.1.1"
PROJECT = "211-command-usb"
LOG_NAME = "device-2-1-1.log"
COMMANDS = ["enable", "disable", "info", "nosuchcommand"]
ANSWER_S = 2


def find_board():
    for port in list_ports.comports():
        if port.vid == VENDOR_ID and port.pid == PRODUCT_ID:
            return port
    return None


def talk(board):
    exchange = []
    with serial.Serial(board.device, timeout=0.5) as port:
        time.sleep(0.2)
        port.reset_input_buffer()
        started = time.monotonic()
        for command in COMMANDS:
            port.write((command + "\n").encode("ascii"))
            exchange.append((time.monotonic() - started, "-->", command))
            deadline = time.monotonic() + ANSWER_S
            while time.monotonic() < deadline:
                line = port.readline().decode("ascii", "replace").strip()
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
        answers = len(exchange) - len(COMMANDS)
        log.write("итог: отправлено команд %d, принято строк %d\n" % (len(COMMANDS), answers))


board = find_board()

if board is None:
    print("Плата не найдена. Проверьте кабель и запишите на плату прошивку задания.", end="\r\n")
else:
    print("Плата на порту " + board.device + ", отправляю команды", end="\r\n")
    exchange = talk(board)
    write_log(board, exchange)
    print("Обмен записан в " + LOG_NAME, end="\r\n")
