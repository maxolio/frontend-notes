'use strict'

/*a
aa
aa
aa
aa*/

const calcBonus = (sum) => sum * 0.1

const onSuccess = (amount, bonus) => console.log(`Сумма:${amount} прошла, Бонус:${bonus}`)

const onError = () => console.log('Ошибка суммы')

const processPayment = (amount, successFn, errorFn) => {
  if (amount > 0) {
    successFn(amount, calcBonus(amount))
  } else {
    errorFn()
  }
}

processPayment(1200, onSuccess, onError)