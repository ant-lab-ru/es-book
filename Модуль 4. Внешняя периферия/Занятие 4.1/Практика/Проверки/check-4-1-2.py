"""Проверка чтения ID BME280 по SPI. Нужен pyserial."""

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


def check(port, log, without_sensor):
    started = time.monotonic()

    def step(command, *expected):
        exchange(port, command, expected, log, started)

    step("help",
         "help             list of commands",
         "i2c_write_reg    <address> <register> <value>",
         "i2c_read_reg     <address> <register>",
         "spi_write        <cs> <command> <value>",
         "spi_read         <cs> <command> [pause_us]")
    expected = "0x00" if without_sensor else "0x60"
    step("spi_read 0x00 0xD0", f"spi: cs 0x00 command 0xD0 value {expected}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", help="Порт ведущей Pico, если подключено несколько плат")
    parser.add_argument("--without-sensor", action="store_true",
                        help="Проверка SPI с четырёхконтактным модулем")
    args = parser.parse_args()

    candidates = [p for p in list_ports.comports()
                  if (p.vid, p.pid) == (0x2E8A, 0x000A)
                  and (args.port is None or p.device == args.port)]
    if not candidates:
        parser.error("Pico не найдена. Проверьте подключение и прошивку.")
    if len(candidates) != 1:
        parser.error("Укажите порт ведущей Pico через --port.")
    board = candidates[0]

    log_path = Path("device-4-1-2.log")
    with serial.Serial(board.device, timeout=0.1, write_timeout=1) as port, \
            log_path.open("w", encoding="utf-8") as log:
        print("задание: 4.1.2", file=log)
        print("режим SPI: без датчика" if args.without_sensor else "режим SPI: BME280", file=log)
        print("проект: 411-i2c-spi", file=log)
        print(f"устройство: {board.vid:04x}:{board.pid:04x}", file=log)
        print(f"серийный номер: {board.serial_number}", file=log)
        print(f"порт: {board.device}", file=log)
        print("начало: " + datetime.now().isoformat(timespec="seconds"), file=log)

        time.sleep(0.2)
        port.reset_input_buffer()
        check(port, log, args.without_sensor)

    if args.without_sensor:
        print("Предупреждение. SPI вернул 0x00 без датчика на шине.")
    print(f"Обмен записан в {log_path}")


if __name__ == "__main__":
    main()
