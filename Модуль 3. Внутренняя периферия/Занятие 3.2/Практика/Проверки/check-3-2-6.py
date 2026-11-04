# Задание 3.2.6: включает сторожевой таймер, убеждается, что прибор работает, вешает
# суперцикл командой hang, дожидается перезапуска платы и спрашивает причину сброса.
# Обмен записывается в файл device-3-2-6.log.

import time
from datetime import datetime

import serial
from serial.tools import list_ports

VENDOR_ID = 0x2E8A
PRODUCT_ID = 0x000A

TASK = "3.2.6"
PROJECT = "321-audio-recorder"
LOG_NAME = "device-3-2-6.log"
BACKSPACE = "\x7f"
# Кадр команды и сколько секунд слушать ответ. RECONNECT — дождаться, пока плата
# перезапустится и снова появится в системе, и открыть порт заново.
RECONNECT = None
STEPS = [
    ("\r", 0.5),
    ("help\r", 1),
    ("info\r", 1),
    ("reset_reason\r", 0.5),
    ("wdt_enable 9000\r", 0.5),
    ("wdt_enable 2000\r", 0.5),
    ("uptime\r", 3),
    ("uptime\r", 0.5),
    ("hang\r", 1),
    (RECONNECT, 15),
    ("reset_reason\r", 0.5),
    ("uptime\r", 0.5),
    ("info\r", 1),
]


def find_board():
    for port in list_ports.comports():
        if port.vid == VENDOR_ID and port.pid == PRODUCT_ID:
            return port
    return None


def printable(text):
    return text.replace(BACKSPACE, "<BS>").replace("\b", "<BS>").replace("\r", "").replace("\n", "")


def reconnect(timeout_s):
    """Ждёт, пока порт пропадёт и появится снова, и открывает его."""
    deadline = time.monotonic() + timeout_s
    gone = False
    while time.monotonic() < deadline:
        board = find_board()
        if board is None:
            gone = True
        elif gone:
            try:
                port = serial.Serial(board.device, timeout=0.05)
                time.sleep(0.5)
                port.reset_input_buffer()
                return port
            except serial.SerialException:
                pass
        time.sleep(0.1)
    return None


def talk(board):
    exchange = []
    port = serial.Serial(board.device, timeout=0.05)
    time.sleep(0.2)
    port.reset_input_buffer()
    started = time.monotonic()
    received = ""
    for frame, listen_s in STEPS:
        if frame is RECONNECT:
            port.close()
            exchange.append((time.monotonic() - started, "---", "ждём перезапуска платы"))
            port = reconnect(listen_s)
            if port is None:
                exchange.append((time.monotonic() - started, "---", "плата не появилась снова"))
                break
            exchange.append((time.monotonic() - started, "---", "плата снова на связи"))
            received = ""
            continue
        port.write(frame.encode("ascii"))
        exchange.append((time.monotonic() - started, "-->", printable(frame)))
        deadline = time.monotonic() + listen_s
        while time.monotonic() < deadline:
            try:
                received += port.read(256).decode("ascii", "replace")
            except serial.SerialException:
                break
            while "\n" in received:
                line, received = received.split("\n", 1)
                line = printable(line).strip()
                if line:
                    exchange.append((time.monotonic() - started, "<--", line))
                    print(line, end="\r\n")
    port.close()
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
        sent = sum(1 for _, direction, _ in exchange if direction == "-->")
        answers = sum(1 for _, direction, _ in exchange if direction == "<--")
        log.write("итог: отправлено кадров %d, принято строк %d\n" % (sent, answers))


board = find_board()

if board is None:
    print("Плата не найдена. Проверьте кабель и запишите на плату прошивку прибора.", end="\r\n")
else:
    print("Плата на порту " + board.device + ", отправляю кадры", end="\r\n")
    exchange = talk(board)
    write_log(board, exchange)
    print("Обмен записан в " + LOG_NAME, end="\r\n")
