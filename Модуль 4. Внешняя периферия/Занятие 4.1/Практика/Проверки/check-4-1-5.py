"""Перекрёстная проверка учебного ведомого по SPI и I²C. Нужен pyserial."""

import argparse
from datetime import datetime
from pathlib import Path
import time

import serial
from serial.tools import list_ports


def exchange(port, command, expected, log, started):
    def record(line):
        print(line)
        print(f"{time.monotonic()-started:8.3f} {line}", file=log, flush=True)

    record(f"--> {command}")
    port.write((command + "\r").encode("ascii"))
    deadline = time.monotonic() + 2
    pending = set(expected)
    while time.monotonic() < deadline:
        line = port.readline().decode("ascii", errors="replace").strip()
        if line:
            record(f"<-- {line}")
            pending.discard(line)
            if not pending:
                return

    raise SystemExit("Не получен ответ: " + ", ".join(sorted(pending)))


def check(port, log, address):
    started = time.monotonic()

    def step(command, *expected):
        exchange(port, command, expected, log, started)

    step("help",
         "help             list of commands",
         "i2c_write_reg    <address> <register> <value>",
         "i2c_read_reg     <address> <register>",
         "spi_write        <cs> <command> <value>",
         "spi_read         <cs> <command> [pause_us]")
    step("spi_read 0x01 0x8a", "error: usage spi_read <cs> <command> [pause_us]")
    step(f"i2c_read_reg {address} 0xD0",
         f"i2c: addr {address} reg 0xD0 value 0x60")
    step("i2c_read_reg 0x43 0x01", "error: i2c transfer")
    step("spi_write 0x01 0x00 0x65", "spi: cs 0x01 command 0x00 sent 0x65")
    step("i2c_read_reg 0x42 0x01", "i2c: addr 0x42 reg 0x01 value 0x01")
    step("i2c_write_reg 0x42 0x01 0x00", "i2c: addr 0x42 reg 0x01 sent 0x00")
    step("spi_read 0x01 0x81 0x64", "spi: cs 0x01 command 0x81 value 0x00")
    step("i2c_write_reg 0x42 0x00 0x65", "i2c: addr 0x42 reg 0x00 sent 0x65")
    step("spi_read 0x01 0x81 0x64", "spi: cs 0x01 command 0x81 value 0x01")
    step("spi_write 0x01 0x01 0x02", "spi: cs 0x01 command 0x01 sent 0x02")
    step("i2c_read_reg 0x42 0x01", "i2c: addr 0x42 reg 0x01 value 0x01")
    step("i2c_read_reg 0x42 0x00", "i2c: addr 0x42 reg 0x00 value 0xFF")
    step("spi_write 0x01 0x00 0x64", "spi: cs 0x01 command 0x00 sent 0x64")
    step("i2c_read_reg 0x42 0x01", "i2c: addr 0x42 reg 0x01 value 0x00")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", help="Порт ведущей Pico, если подключено несколько плат")
    parser.add_argument("--address", choices=("0x76", "0x77"), default="0x76")
    args = parser.parse_args()

    candidates = [p for p in list_ports.comports()
                  if (p.vid, p.pid) == (0x2E8A, 0x000A)
                  and (args.port is None or p.device == args.port)]
    if not candidates:
        parser.error("Pico не найдена. Проверьте подключение и прошивку.")
    if len(candidates) != 1:
        parser.error("Укажите порт ведущей Pico через --port.")
    board = candidates[0]

    log_path = Path("device-4-1-5.log")
    with serial.Serial(board.device, timeout=0.1, write_timeout=1) as port, \
            log_path.open("w", encoding="utf-8") as log:
        print("задание: 4.1.5", file=log)
        print("проект: 411-i2c-spi", file=log)
        print(f"устройство: {board.vid:04x}:{board.pid:04x}", file=log)
        print(f"серийный номер: {board.serial_number}", file=log)
        print(f"порт: {board.device}", file=log)
        print("начало: " + datetime.now().isoformat(timespec="seconds"), file=log)

        time.sleep(0.2)
        port.reset_input_buffer()
        check(port, log, args.address)

    print(f"Обмен записан в {log_path}")


if __name__ == "__main__":
    main()
