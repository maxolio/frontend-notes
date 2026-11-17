const courierName = 'Максим';
const daysWorked = 7;
const baseRate = null;

const finalRate = baseRate ?? 1000;

function calcSalary(daysCount, dailyRate = 1000) {
  if (daysCount <= 0) {
    return 0;
  }

  let totalSalary = 0;

  for (let day = 1; day <= daysCount; day++) {
    if (day % 7 === 0) {
      continue;
    }

    if (day % 2 === 0) {
      totalSalary += dailyRate + 500;
    } else {
      totalSalary += dailyRate;
    }
  }

  return totalSalary;
}

const salary = calcSalary(daysWorked, finalRate);

console.log(`Курьер ${courierName} заработал за ${daysWorked} дн.: ${salary} руб.`);


