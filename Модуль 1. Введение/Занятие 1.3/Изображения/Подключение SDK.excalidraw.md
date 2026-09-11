---

excalidraw-plugin: parsed
tags: [excalidraw]

---
==⚠  Switch to EXCALIDRAW VIEW in the MORE OPTIONS menu of this document. ⚠==


# Excalidraw Data

## Text Elements
main.c
#include "pico/stdlib.h" ^65ee2668ffd5b7f1

Препроцессор
и компилятор ^275d0afa5006922d

main.o
вызов gpio_put()
без адреса ^a7d67f86bf1ee8f0

Нет #include — ошибка компиляции: ^05fa64baf2bbf28d

implicit declaration of function 'gpio_put' ^2ee99d5e112b55e1

CMakeLists.txt
target_link_libraries(
    blink pico_stdlib) ^a247523a66c5f94b

CMake и Make
находят библиотеку ^f5d570496c671329

gpio.o из SDK
сам код функции
gpio_put() ^03abac73961bf372

Нет библиотеки — ошибка компоновки: ^6eba7c89ff122bed

undefined reference to 'gpio_put' ^9f32d7164c9e5d48

Компоновщик
связывает вызов
с кодом функции ^ff99e7073fd42831

blink.elf ^ab34e415749d09da


## Drawing
```json
{
 "type": "excalidraw",
 "version": 2,
 "source": "https://github.com/zsviczian/obsidian-excalidraw-plugin",
 "elements": [
  {
   "angle": 0,
   "strokeColor": "#495057",
   "backgroundColor": "#ffffff",
   "fillStyle": "solid",
   "strokeWidth": 2,
   "strokeStyle": "solid",
   "roughness": 0,
   "opacity": 100,
   "groupIds": [],
   "frameId": null,
   "roundness": {
    "type": 3
   },
   "seed": 1956006,
   "version": 1,
   "versionNonce": 1,
   "isDeleted": false,
   "boundElements": [
    {
     "type": "text",
     "id": "65ee2668ffd5b7f1"
    }
   ],
   "updated": 1735000000000,
   "link": null,
   "locked": false,
   "id": "c79a1834a127f396",
   "type": "rectangle",
   "x": 25,
   "y": 60,
   "width": 260,
   "height": 90
  },
  {
   "angle": 0,
   "strokeColor": "#1e1e1e",
   "backgroundColor": "transparent",
   "fillStyle": "solid",
   "strokeWidth": 2,
   "strokeStyle": "solid",
   "roughness": 0,
   "opacity": 100,
   "groupIds": [],
   "frameId": null,
   "roundness": null,
   "seed": 1963925,
   "version": 1,
   "versionNonce": 1,
   "isDeleted": false,
   "boundElements": [],
   "updated": 1735000000000,
   "link": null,
   "locked": false,
   "id": "65ee2668ffd5b7f1",
   "type": "text",
   "x": 65.96,
   "y": 87.5,
   "width": 178.08,
   "height": 35.0,
   "fontSize": 14,
   "fontFamily": 2,
   "textAlign": "center",
   "verticalAlign": "middle",
   "containerId": "c79a1834a127f396",
   "text": "main.c\n#include \"pico/stdlib.h\"",
   "originalText": "main.c\n#include \"pico/stdlib.h\"",
   "lineHeight": 1.25,
   "baseline": 11.06
  },
  {
   "angle": 0,
   "strokeColor": "#f08c00",
   "backgroundColor": "#ffec99",
   "fillStyle": "solid",
   "strokeWidth": 2,
   "strokeStyle": "solid",
   "roughness": 0,
   "opacity": 100,
   "groupIds": [],
   "frameId": null,
   "roundness": {
    "type": 3
   },
   "seed": 1971844,
   "version": 1,
   "versionNonce": 1,
   "isDeleted": false,
   "boundElements": [
    {
     "type": "text",
     "id": "275d0afa5006922d"
    }
   ],
   "updated": 1735000000000,
   "link": null,
   "locked": false,
   "id": "f6e7be04c12f0912",
   "type": "rectangle",
   "x": 330,
   "y": 60,
   "width": 190,
   "height": 90
  },
  {
   "angle": 0,
   "strokeColor": "#1e1e1e",
   "backgroundColor": "transparent",
   "fillStyle": "solid",
   "strokeWidth": 2,
   "strokeStyle": "solid",
   "roughness": 0,
   "opacity": 100,
   "groupIds": [],
   "frameId": null,
   "roundness": null,
   "seed": 1979763,
   "version": 1,
   "versionNonce": 1,
   "isDeleted": false,
   "boundElements": [],
   "updated": 1735000000000,
   "link": null,
   "locked": false,
   "id": "275d0afa5006922d",
   "type": "text",
   "x": 377.3,
   "y": 86.25,
   "width": 95.4,
   "height": 37.5,
   "fontSize": 15,
   "fontFamily": 2,
   "textAlign": "center",
   "verticalAlign": "middle",
   "containerId": "f6e7be04c12f0912",
   "text": "Препроцессор\nи компилятор",
   "originalText": "Препроцессор\nи компилятор",
   "lineHeight": 1.25,
   "baseline": 11.85
  },
  {
   "angle": 0,
   "strokeColor": "#1971c2",
   "backgroundColor": "#a5d8ff",
   "fillStyle": "solid",
   "strokeWidth": 2,
   "strokeStyle": "solid",
   "roughness": 0,
   "opacity": 100,
   "groupIds": [],
   "frameId": null,
   "roundness": {
    "type": 3
   },
   "seed": 1987682,
   "version": 1,
   "versionNonce": 1,
   "isDeleted": false,
   "boundElements": [
    {
     "type": "text",
     "id": "a7d67f86bf1ee8f0"
    }
   ],
   "updated": 1735000000000,
   "link": null,
   "locked": false,
   "id": "749a007aec47e0b3",
   "type": "rectangle",
   "x": 560,
   "y": 60,
   "width": 210,
   "height": 90
  },
  {
   "angle": 0,
   "strokeColor": "#1e1e1e",
   "backgroundColor": "transparent",
   "fillStyle": "solid",
   "strokeWidth": 2,
   "strokeStyle": "solid",
   "roughness": 0,
   "opacity": 100,
   "groupIds": [],
   "frameId": null,
   "roundness": null,
   "seed": 1995601,
   "version": 1,
   "versionNonce": 1,
   "isDeleted": false,
   "boundElements": [],
   "updated": 1735000000000,
   "link": null,
   "locked": false,
   "id": "a7d67f86bf1ee8f0",
   "type": "text",
   "x": 605.64,
   "y": 78.75,
   "width": 118.72,
   "height": 52.5,
   "fontSize": 14,
   "fontFamily": 2,
   "textAlign": "center",
   "verticalAlign": "middle",
   "containerId": "749a007aec47e0b3",
   "text": "main.o\nвызов gpio_put()\nбез адреса",
   "originalText": "main.o\nвызов gpio_put()\nбез адреса",
   "lineHeight": 1.25,
   "baseline": 11.06
  },
  {
   "angle": 0,
   "strokeColor": "#e03131",
   "backgroundColor": "transparent",
   "fillStyle": "solid",
   "strokeWidth": 2,
   "strokeStyle": "solid",
   "roughness": 0,
   "opacity": 100,
   "groupIds": [],
   "frameId": null,
   "roundness": null,
   "seed": 2003520,
   "version": 1,
   "versionNonce": 1,
   "isDeleted": false,
   "boundElements": [],
   "updated": 1735000000000,
   "link": null,
   "locked": false,
   "id": "05fa64baf2bbf28d",
   "type": "text",
   "x": 25,
   "y": 165,
   "width": 227.37,
   "height": 16.25,
   "fontSize": 13,
   "fontFamily": 2,
   "textAlign": "left",
   "verticalAlign": "top",
   "containerId": null,
   "text": "Нет #include — ошибка компиляции:",
   "originalText": "Нет #include — ошибка компиляции:",
   "lineHeight": 1.25,
   "baseline": 10.27
  },
  {
   "angle": 0,
   "strokeColor": "#e03131",
   "backgroundColor": "transparent",
   "fillStyle": "solid",
   "strokeWidth": 2,
   "strokeStyle": "solid",
   "roughness": 0,
   "opacity": 100,
   "groupIds": [],
   "frameId": null,
   "roundness": null,
   "seed": 2011439,
   "version": 1,
   "versionNonce": 1,
   "isDeleted": false,
   "boundElements": [],
   "updated": 1735000000000,
   "link": null,
   "locked": false,
   "id": "2ee99d5e112b55e1",
   "type": "text",
   "x": 25,
   "y": 186,
   "width": 296.27,
   "height": 16.25,
   "fontSize": 13,
   "fontFamily": 3,
   "textAlign": "left",
   "verticalAlign": "top",
   "containerId": null,
   "text": "implicit declaration of function 'gpio_put'",
   "originalText": "implicit declaration of function 'gpio_put'",
   "lineHeight": 1.25,
   "baseline": 10.27
  },
  {
   "angle": 0,
   "strokeColor": "#495057",
   "backgroundColor": "#ffffff",
   "fillStyle": "solid",
   "strokeWidth": 2,
   "strokeStyle": "solid",
   "roughness": 0,
   "opacity": 100,
   "groupIds": [],
   "frameId": null,
   "roundness": {
    "type": 3
   },
   "seed": 2019358,
   "version": 1,
   "versionNonce": 1,
   "isDeleted": false,
   "boundElements": [
    {
     "type": "text",
     "id": "a247523a66c5f94b"
    }
   ],
   "updated": 1735000000000,
   "link": null,
   "locked": false,
   "id": "07709f30957a5999",
   "type": "rectangle",
   "x": 25,
   "y": 240,
   "width": 260,
   "height": 90
  },
  {
   "angle": 0,
   "strokeColor": "#1e1e1e",
   "backgroundColor": "transparent",
   "fillStyle": "solid",
   "strokeWidth": 2,
   "strokeStyle": "solid",
   "roughness": 0,
   "opacity": 100,
   "groupIds": [],
   "frameId": null,
   "roundness": null,
   "seed": 2027277,
   "version": 1,
   "versionNonce": 1,
   "isDeleted": false,
   "boundElements": [],
   "updated": 1735000000000,
   "link": null,
   "locked": false,
   "id": "a247523a66c5f94b",
   "type": "text",
   "x": 79.21,
   "y": 260.62,
   "width": 151.58,
   "height": 48.75,
   "fontSize": 13,
   "fontFamily": 2,
   "textAlign": "center",
   "verticalAlign": "middle",
   "containerId": "07709f30957a5999",
   "text": "CMakeLists.txt\ntarget_link_libraries(\n    blink pico_stdlib)",
   "originalText": "CMakeLists.txt\ntarget_link_libraries(\n    blink pico_stdlib)",
   "lineHeight": 1.25,
   "baseline": 10.27
  },
  {
   "angle": 0,
   "strokeColor": "#f08c00",
   "backgroundColor": "#ffec99",
   "fillStyle": "solid",
   "strokeWidth": 2,
   "strokeStyle": "solid",
   "roughness": 0,
   "opacity": 100,
   "groupIds": [],
   "frameId": null,
   "roundness": {
    "type": 3
   },
   "seed": 2035196,
   "version": 1,
   "versionNonce": 1,
   "isDeleted": false,
   "boundElements": [
    {
     "type": "text",
     "id": "f5d570496c671329"
    }
   ],
   "updated": 1735000000000,
   "link": null,
   "locked": false,
   "id": "345ccb00a1e54e3b",
   "type": "rectangle",
   "x": 330,
   "y": 240,
   "width": 190,
   "height": 90
  },
  {
   "angle": 0,
   "strokeColor": "#1e1e1e",
   "backgroundColor": "transparent",
   "fillStyle": "solid",
   "strokeWidth": 2,
   "strokeStyle": "solid",
   "roughness": 0,
   "opacity": 100,
   "groupIds": [],
   "frameId": null,
   "roundness": null,
   "seed": 2043115,
   "version": 1,
   "versionNonce": 1,
   "isDeleted": false,
   "boundElements": [],
   "updated": 1735000000000,
   "link": null,
   "locked": false,
   "id": "f5d570496c671329",
   "type": "text",
   "x": 353.45,
   "y": 266.25,
   "width": 143.1,
   "height": 37.5,
   "fontSize": 15,
   "fontFamily": 2,
   "textAlign": "center",
   "verticalAlign": "middle",
   "containerId": "345ccb00a1e54e3b",
   "text": "CMake и Make\nнаходят библиотеку",
   "originalText": "CMake и Make\nнаходят библиотеку",
   "lineHeight": 1.25,
   "baseline": 11.85
  },
  {
   "angle": 0,
   "strokeColor": "#2f9e44",
   "backgroundColor": "#b2f2bb",
   "fillStyle": "solid",
   "strokeWidth": 2,
   "strokeStyle": "solid",
   "roughness": 0,
   "opacity": 100,
   "groupIds": [],
   "frameId": null,
   "roundness": {
    "type": 3
   },
   "seed": 2051034,
   "version": 1,
   "versionNonce": 1,
   "isDeleted": false,
   "boundElements": [
    {
     "type": "text",
     "id": "03abac73961bf372"
    }
   ],
   "updated": 1735000000000,
   "link": null,
   "locked": false,
   "id": "80eacf3d57eb85a6",
   "type": "rectangle",
   "x": 560,
   "y": 240,
   "width": 210,
   "height": 90
  },
  {
   "angle": 0,
   "strokeColor": "#1e1e1e",
   "backgroundColor": "transparent",
   "fillStyle": "solid",
   "strokeWidth": 2,
   "strokeStyle": "solid",
   "roughness": 0,
   "opacity": 100,
   "groupIds": [],
   "frameId": null,
   "roundness": null,
   "seed": 2058953,
   "version": 1,
   "versionNonce": 1,
   "isDeleted": false,
   "boundElements": [],
   "updated": 1735000000000,
   "link": null,
   "locked": false,
   "id": "03abac73961bf372",
   "type": "text",
   "x": 609.35,
   "y": 258.75,
   "width": 111.3,
   "height": 52.5,
   "fontSize": 14,
   "fontFamily": 2,
   "textAlign": "center",
   "verticalAlign": "middle",
   "containerId": "80eacf3d57eb85a6",
   "text": "gpio.o из SDK\nсам код функции\ngpio_put()",
   "originalText": "gpio.o из SDK\nсам код функции\ngpio_put()",
   "lineHeight": 1.25,
   "baseline": 11.06
  },
  {
   "angle": 0,
   "strokeColor": "#e03131",
   "backgroundColor": "transparent",
   "fillStyle": "solid",
   "strokeWidth": 2,
   "strokeStyle": "solid",
   "roughness": 0,
   "opacity": 100,
   "groupIds": [],
   "frameId": null,
   "roundness": null,
   "seed": 2066872,
   "version": 1,
   "versionNonce": 1,
   "isDeleted": false,
   "boundElements": [],
   "updated": 1735000000000,
   "link": null,
   "locked": false,
   "id": "6eba7c89ff122bed",
   "type": "text",
   "x": 25,
   "y": 345,
   "width": 241.15,
   "height": 16.25,
   "fontSize": 13,
   "fontFamily": 2,
   "textAlign": "left",
   "verticalAlign": "top",
   "containerId": null,
   "text": "Нет библиотеки — ошибка компоновки:",
   "originalText": "Нет библиотеки — ошибка компоновки:",
   "lineHeight": 1.25,
   "baseline": 10.27
  },
  {
   "angle": 0,
   "strokeColor": "#e03131",
   "backgroundColor": "transparent",
   "fillStyle": "solid",
   "strokeWidth": 2,
   "strokeStyle": "solid",
   "roughness": 0,
   "opacity": 100,
   "groupIds": [],
   "frameId": null,
   "roundness": null,
   "seed": 2074791,
   "version": 1,
   "versionNonce": 1,
   "isDeleted": false,
   "boundElements": [],
   "updated": 1735000000000,
   "link": null,
   "locked": false,
   "id": "9f32d7164c9e5d48",
   "type": "text",
   "x": 25,
   "y": 366,
   "width": 227.37,
   "height": 16.25,
   "fontSize": 13,
   "fontFamily": 3,
   "textAlign": "left",
   "verticalAlign": "top",
   "containerId": null,
   "text": "undefined reference to 'gpio_put'",
   "originalText": "undefined reference to 'gpio_put'",
   "lineHeight": 1.25,
   "baseline": 10.27
  },
  {
   "angle": 0,
   "strokeColor": "#1e1e1e",
   "backgroundColor": "transparent",
   "fillStyle": "solid",
   "strokeWidth": 2,
   "strokeStyle": "solid",
   "roughness": 0,
   "opacity": 100,
   "groupIds": [],
   "frameId": null,
   "roundness": {
    "type": 2
   },
   "seed": 2074791,
   "version": 1,
   "versionNonce": 1,
   "isDeleted": false,
   "boundElements": [],
   "updated": 1735000000000,
   "link": null,
   "locked": false,
   "id": "1ceffa2d806ea920",
   "type": "arrow",
   "x": 285,
   "y": 105,
   "width": 39,
   "height": 0,
   "points": [
    [
     0,
     0
    ],
    [
     39,
     0
    ]
   ],
   "lastCommittedPoint": null,
   "startBinding": null,
   "endBinding": null,
   "startArrowhead": null,
   "endArrowhead": "arrow"
  },
  {
   "angle": 0,
   "strokeColor": "#1e1e1e",
   "backgroundColor": "transparent",
   "fillStyle": "solid",
   "strokeWidth": 2,
   "strokeStyle": "solid",
   "roughness": 0,
   "opacity": 100,
   "groupIds": [],
   "frameId": null,
   "roundness": {
    "type": 2
   },
   "seed": 2082710,
   "version": 1,
   "versionNonce": 1,
   "isDeleted": false,
   "boundElements": [],
   "updated": 1735000000000,
   "link": null,
   "locked": false,
   "id": "fb914daa4ba27ef3",
   "type": "arrow",
   "x": 520,
   "y": 105,
   "width": 34,
   "height": 0,
   "points": [
    [
     0,
     0
    ],
    [
     34,
     0
    ]
   ],
   "lastCommittedPoint": null,
   "startBinding": null,
   "endBinding": null,
   "startArrowhead": null,
   "endArrowhead": "arrow"
  },
  {
   "angle": 0,
   "strokeColor": "#1e1e1e",
   "backgroundColor": "transparent",
   "fillStyle": "solid",
   "strokeWidth": 2,
   "strokeStyle": "solid",
   "roughness": 0,
   "opacity": 100,
   "groupIds": [],
   "frameId": null,
   "roundness": {
    "type": 2
   },
   "seed": 2090629,
   "version": 1,
   "versionNonce": 1,
   "isDeleted": false,
   "boundElements": [],
   "updated": 1735000000000,
   "link": null,
   "locked": false,
   "id": "e9f0cf94a82769f8",
   "type": "arrow",
   "x": 285,
   "y": 285,
   "width": 39,
   "height": 0,
   "points": [
    [
     0,
     0
    ],
    [
     39,
     0
    ]
   ],
   "lastCommittedPoint": null,
   "startBinding": null,
   "endBinding": null,
   "startArrowhead": null,
   "endArrowhead": "arrow"
  },
  {
   "angle": 0,
   "strokeColor": "#1e1e1e",
   "backgroundColor": "transparent",
   "fillStyle": "solid",
   "strokeWidth": 2,
   "strokeStyle": "solid",
   "roughness": 0,
   "opacity": 100,
   "groupIds": [],
   "frameId": null,
   "roundness": {
    "type": 2
   },
   "seed": 2098548,
   "version": 1,
   "versionNonce": 1,
   "isDeleted": false,
   "boundElements": [],
   "updated": 1735000000000,
   "link": null,
   "locked": false,
   "id": "af676bc2e0730011",
   "type": "arrow",
   "x": 520,
   "y": 285,
   "width": 34,
   "height": 0,
   "points": [
    [
     0,
     0
    ],
    [
     34,
     0
    ]
   ],
   "lastCommittedPoint": null,
   "startBinding": null,
   "endBinding": null,
   "startArrowhead": null,
   "endArrowhead": "arrow"
  },
  {
   "angle": 0,
   "strokeColor": "#6741d9",
   "backgroundColor": "#d0bfff",
   "fillStyle": "solid",
   "strokeWidth": 2,
   "strokeStyle": "solid",
   "roughness": 0,
   "opacity": 100,
   "groupIds": [],
   "frameId": null,
   "roundness": {
    "type": 3
   },
   "seed": 2114386,
   "version": 1,
   "versionNonce": 1,
   "isDeleted": false,
   "boundElements": [
    {
     "type": "text",
     "id": "ff99e7073fd42831"
    }
   ],
   "updated": 1735000000000,
   "link": null,
   "locked": false,
   "id": "52bb3fb1ccbbc679",
   "type": "rectangle",
   "x": 810,
   "y": 150,
   "width": 160,
   "height": 90
  },
  {
   "angle": 0,
   "strokeColor": "#1e1e1e",
   "backgroundColor": "transparent",
   "fillStyle": "solid",
   "strokeWidth": 2,
   "strokeStyle": "solid",
   "roughness": 0,
   "opacity": 100,
   "groupIds": [],
   "frameId": null,
   "roundness": null,
   "seed": 2122305,
   "version": 1,
   "versionNonce": 1,
   "isDeleted": false,
   "boundElements": [],
   "updated": 1735000000000,
   "link": null,
   "locked": false,
   "id": "ff99e7073fd42831",
   "type": "text",
   "x": 834.35,
   "y": 168.75,
   "width": 111.3,
   "height": 52.5,
   "fontSize": 14,
   "fontFamily": 2,
   "textAlign": "center",
   "verticalAlign": "middle",
   "containerId": "52bb3fb1ccbbc679",
   "text": "Компоновщик\nсвязывает вызов\nс кодом функции",
   "originalText": "Компоновщик\nсвязывает вызов\nс кодом функции",
   "lineHeight": 1.25,
   "baseline": 11.06
  },
  {
   "angle": 0,
   "strokeColor": "#1e1e1e",
   "backgroundColor": "transparent",
   "fillStyle": "solid",
   "strokeWidth": 2,
   "strokeStyle": "solid",
   "roughness": 0,
   "opacity": 100,
   "groupIds": [],
   "frameId": null,
   "roundness": {
    "type": 2
   },
   "seed": 2122305,
   "version": 1,
   "versionNonce": 1,
   "isDeleted": false,
   "boundElements": [],
   "updated": 1735000000000,
   "link": null,
   "locked": false,
   "id": "79b34e035abf2828",
   "type": "arrow",
   "x": 770,
   "y": 120,
   "width": 90,
   "height": 24,
   "points": [
    [
     0,
     0
    ],
    [
     90,
     24
    ]
   ],
   "lastCommittedPoint": null,
   "startBinding": null,
   "endBinding": null,
   "startArrowhead": null,
   "endArrowhead": "arrow"
  },
  {
   "angle": 0,
   "strokeColor": "#1e1e1e",
   "backgroundColor": "transparent",
   "fillStyle": "solid",
   "strokeWidth": 2,
   "strokeStyle": "solid",
   "roughness": 0,
   "opacity": 100,
   "groupIds": [],
   "frameId": null,
   "roundness": {
    "type": 2
   },
   "seed": 2130224,
   "version": 1,
   "versionNonce": 1,
   "isDeleted": false,
   "boundElements": [],
   "updated": 1735000000000,
   "link": null,
   "locked": false,
   "id": "79a187fe49435dfa",
   "type": "arrow",
   "x": 770,
   "y": 270,
   "width": 90,
   "height": 24,
   "points": [
    [
     0,
     0
    ],
    [
     90,
     -24
    ]
   ],
   "lastCommittedPoint": null,
   "startBinding": null,
   "endBinding": null,
   "startArrowhead": null,
   "endArrowhead": "arrow"
  },
  {
   "angle": 0,
   "strokeColor": "#e8590c",
   "backgroundColor": "#ffd8a8",
   "fillStyle": "solid",
   "strokeWidth": 2,
   "strokeStyle": "solid",
   "roughness": 0,
   "opacity": 100,
   "groupIds": [],
   "frameId": null,
   "roundness": {
    "type": 3
   },
   "seed": 2146062,
   "version": 1,
   "versionNonce": 1,
   "isDeleted": false,
   "boundElements": [
    {
     "type": "text",
     "id": "ab34e415749d09da"
    }
   ],
   "updated": 1735000000000,
   "link": null,
   "locked": false,
   "id": "530284c12bc3537b",
   "type": "rectangle",
   "x": 810,
   "y": 290,
   "width": 160,
   "height": 55
  },
  {
   "angle": 0,
   "strokeColor": "#1e1e1e",
   "backgroundColor": "transparent",
   "fillStyle": "solid",
   "strokeWidth": 2,
   "strokeStyle": "solid",
   "roughness": 0,
   "opacity": 100,
   "groupIds": [],
   "frameId": null,
   "roundness": null,
   "seed": 2153981,
   "version": 1,
   "versionNonce": 1,
   "isDeleted": false,
   "boundElements": [],
   "updated": 1735000000000,
   "link": null,
   "locked": false,
   "id": "ab34e415749d09da",
   "type": "text",
   "x": 851.84,
   "y": 307.5,
   "width": 76.32,
   "height": 20.0,
   "fontSize": 16,
   "fontFamily": 2,
   "textAlign": "center",
   "verticalAlign": "middle",
   "containerId": "530284c12bc3537b",
   "text": "blink.elf",
   "originalText": "blink.elf",
   "lineHeight": 1.25,
   "baseline": 12.64
  },
  {
   "angle": 0,
   "strokeColor": "#1e1e1e",
   "backgroundColor": "transparent",
   "fillStyle": "solid",
   "strokeWidth": 2,
   "strokeStyle": "solid",
   "roughness": 0,
   "opacity": 100,
   "groupIds": [],
   "frameId": null,
   "roundness": {
    "type": 2
   },
   "seed": 2153981,
   "version": 1,
   "versionNonce": 1,
   "isDeleted": false,
   "boundElements": [],
   "updated": 1735000000000,
   "link": null,
   "locked": false,
   "id": "ee601f5129ef46a4",
   "type": "arrow",
   "x": 890,
   "y": 240,
   "width": 0,
   "height": 44,
   "points": [
    [
     0,
     0
    ],
    [
     0,
     44
    ]
   ],
   "lastCommittedPoint": null,
   "startBinding": null,
   "endBinding": null,
   "startArrowhead": null,
   "endArrowhead": "arrow"
  }
 ],
 "appState": {
  "gridSize": null,
  "viewBackgroundColor": "#ffffff"
 },
 "files": {}
}
```
%%