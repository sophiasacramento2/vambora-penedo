export const heatPoints: [number, number, number][] = [
  [-10.2929, -36.5859, 0.95],
  [-10.2948, -36.5838, 0.85],
  [-10.2972, -36.5812, 0.78],
  [-10.3015, -36.5785, 0.72],
  [-10.3068, -36.5752, 0.68],
  [-10.3135, -36.5718, 0.76],
  [-10.3211, -36.5687, 0.82],
  [-10.3332, -36.5661, 0.88],
  [-10.3438, -36.5640, 0.73],
  [-10.3610, -36.5632, 0.67],
  [-10.3867, -36.5565, 0.79],
  [-10.4081, -36.5600, 0.83],
  [-10.4210, -36.5592, 0.91],
  [-10.4300, -36.5370, 0.86],
  [-10.4320, -36.5086, 0.94],
  [-10.4255, -36.4898, 0.71],
  [-10.4147, -36.4715, 0.69],
  [-10.4098, -36.4659, 0.64],
];

export const delayByLine = [
  { linha: "Linha 01", atraso: 18 },
  { linha: "Linha 02", atraso: 11 },
  { linha: "Linha 03", atraso: 7 },
  { linha: "Linha 04", atraso: 24 },
  { linha: "Van Centro", atraso: 9 },
  { linha: "Barco 02", atraso: 5 },
];

export const demandByHour = [
  { hora: "06:00", demanda: 45 },
  { hora: "07:00", demanda: 92 },
  { hora: "08:00", demanda: 110 },
  { hora: "09:00", demanda: 63 },
  { hora: "10:00", demanda: 58 },
  { hora: "11:00", demanda: 72 },
  { hora: "12:00", demanda: 88 },
  { hora: "13:00", demanda: 66 },
  { hora: "14:00", demanda: 61 },
  { hora: "15:00", demanda: 74 },
  { hora: "16:00", demanda: 98 },
  { hora: "17:00", demanda: 121 },
  { hora: "18:00", demanda: 116 },
  { hora: "19:00", demanda: 81 },
];

export const modalDemand = [
  { name: "Ônibus", value: 62 },
  { name: "Vans", value: 24 },
  { name: "Barcos", value: 14 },
];

export const chronicDelayTable = [
  { linha: "Linha 01", faixa: "07:00 - 08:00", media: 18, ocorrencias: 12, status: "Atenção" },
  { linha: "Linha 04", faixa: "07:00 - 08:00", media: 24, ocorrencias: 18, status: "Crítico" },
  { linha: "Linha 04", faixa: "17:00 - 18:00", media: 27, ocorrencias: 20, status: "Crítico" },
  { linha: "Linha 02", faixa: "12:00 - 13:00", media: 11, ocorrencias: 9, status: "Moderado" },
  { linha: "Van Centro", faixa: "16:00 - 17:00", media: 9, ocorrencias: 8, status: "Moderado" },
];