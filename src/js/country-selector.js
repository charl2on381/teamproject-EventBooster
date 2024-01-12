import { ticketmasterAPI } from './index';

const selectCountry = document.querySelector('.countries__wrapp')
const countriesList = document.querySelector('.countries__list')
const selected = document.querySelector('.countries__wrapp');


selectCountry.addEventListener('click', onShowCountriesList)

function onShowCountriesList(e) {
  e.stopPropagation(); // Предотвращаем всплытие события click от элемента selectCountry до document
  countriesList.classList.toggle('is-hidden');
  document.addEventListener('click', onCloseCountriesList);
}

function onCloseCountriesList() {
  countriesList.classList.add('is-hidden');
  document.removeEventListener('click', onCloseCountriesList);
}


export function chooseCountry() {
  const optionsList = document.querySelectorAll('.option');

  optionsList.forEach(element => {
    element.addEventListener('click', event => {
      selected.innerHTML = element.querySelector('label').innerHTML;
      ticketmasterAPI.searchCountry = event.target.id;
      console.log(ticketmasterAPI.searchCountry);
      countriesList.classList.add('is-hidden');
    });
  });
}




