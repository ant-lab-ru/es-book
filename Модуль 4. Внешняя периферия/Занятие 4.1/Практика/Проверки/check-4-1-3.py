"""Проверка ответа USB во время работы второго суперцикла. Нужен pyserial."""

import argparse
import time

import serial
from serial.tools import list_ports


def exchange(port, command, expected):
    print(f"--> {command}")
    port.write((command + "\r").encode("ascii"))
    deadline = time.monotonic() + 2
    pending = set(expected)
    while time.monotonic() < deadline:
        line = port.readline().decode("ascii", errors="replace").strip()
        if line:
            print(f"<-- {line}")
            pending.discard(line)
            if not pending:
                return

    raise SystemExit("Не получен ответ: " + ", ".join(sorted(pending)))


def check(port):
    def step(command, *expected):
        exchange(port, command, expected)

    step("help",
         "help             list of commands",
         "i2c_write_reg    <address> <register> <value>",
         "i2c_read_reg     <address> <register>",
         "spi_write        <cs> <command> <value>",
         "spi_read         <cs> <command> [pause_us]")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", help="Порт ведущей Pico, если подключено несколько плат")
    args = parser.parse_args()

    candidates = [p for p in list_ports.comports()
                  if (p.vid, p.pid) == (0x2E8A, 0x000A)
                  and (args.port is None or p.device == args.port)]
    if not candidates:
        parser.error("Pico не найдена. Проверьте подключение и прошивку.")
    if len(candidates) != 1:
        parser.error("Укажите порт ведущей Pico через --port.")
    board = candidates[0]

    with serial.Serial(board.device, timeout=0.1, write_timeout=1) as port:
        time.sleep(0.2)
        port.reset_input_buffer()
        check(port)


if __name__ == "__main__":
    main()
