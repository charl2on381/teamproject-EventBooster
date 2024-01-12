import countrySelector from './country-selector';
import { chooseCountry } from './country-selector';
import { TicketmasterAPI } from './ticketmaster-api';
import { Report } from 'notiflix/build/notiflix-report-aio';
import iconClose from '../images/close.svg'

const searchForm = document.querySelector('.header__form');
const eventsList = document.querySelector('.events__list');
const countriesList = document.querySelector('.countries__list')
const backdrop = document.querySelector('.backdrop')
const modalEl = document.querySelector('.modal')
import { countries } from './constants'
const pagesEl = document.querySelector('.events__pages')
let totalPages = 0
const iconBarcodeSVG = `
  <svg class="barcode" width="24" height="16" viewBox="0 0 45 32">
    <path d="M5.02 1.569H0v30.118h5.02V1.569zM17.645 1.569h-5.02v30.118h5.02V1.569zM25.25 1.569h-5.019v30.118h5.019V1.569zM45.177 1.569h-7.453v30.118h7.453V1.569zM10.039 1.569H7.605v30.118h2.434V1.569zM30.118 1.569h-2.434v30.118h2.434V1.569zM35.137 1.569h-2.434v30.118h2.434V1.569z" />
  </svg>
`;


export const ticketmasterAPI = new TicketmasterAPI();

let countryBefore = null;

renderCountries(countries)
renderBaseMarkup()
searchForm.addEventListener('submit', onSerchQuerySubmit);
pagesEl.addEventListener('click', fetchAnotherPage)

async function onSerchQuerySubmit(e) {
  e.preventDefault();

  const searchValue = e.currentTarget.elements.serchQuery.value;
  let searchQuery = ticketmasterAPI.searchQuery;


  if (
    searchQuery === searchValue && searchValue &&
    countryBefore === ticketmasterAPI.searchCountry
  ) {
    return;
  }

  countryBefore = ticketmasterAPI.searchCountry;
  ticketmasterAPI.searchQuery = searchValue;
  ticketmasterAPI.page = 0;



  renderBaseMarkup();
}

async function renderBaseMarkup() {
  try {
    const response = await ticketmasterAPI.fetchTickets();
    const baseMarkup = response._embedded.events
    totalPages = response.page.totalPages

    eventsList.innerHTML = baseMarkup.map((baseMarkup) => {
      const noInfo = "нет информации"
      const isVenues = baseMarkup?._embedded?.venues
      const venues = isVenues?.length && isVenues[0]

      const isPriceRanges = baseMarkup?.priceRanges
      const priceRanges = isPriceRanges?.length && isPriceRanges[0]

      const name = baseMarkup.name || noInfo
      const info = baseMarkup?.accessibility?.info || noInfo;
      const localDate = baseMarkup?.dates?.start?.localDate || noInfo;
      const localTime = baseMarkup?.dates?.start?.localTime || noInfo;
      const nameOfThePlace = venues?.name || noInfo;
      const timezone = venues?.timezone || noInfo;
      const nameOfCity = venues?.city?.name || noInfo;
      const nameOfCountry = venues?.country?.name || noInfo;
      const minPrice = priceRanges?.min || noInfo;
      const maxPrice = priceRanges?.max || noInfo;
      const currency = priceRanges?.currency || noInfo;
      const type = priceRanges?.type || noInfo;
      const previewImgUrl = baseMarkup?.images[5]?.url || noInfo;
      const buyTicketUrl = baseMarkup?.url || noInfo;

      const cardData = {
        info, localDate, localTime, timezone, nameOfCity, nameOfCountry,
        name, minPrice, maxPrice, maxPrice, currency, type, previewImgUrl,
        localDate, localDate, nameOfThePlace, buyTicketUrl
      }
      const encodedCardData = encodeURIComponent(JSON.stringify(cardData));


      return `
          <li class="events__item list" data-list=${encodedCardData}>
              <img class="events__img" src="${previewImgUrl}" alt="" width="120" height="120">
              <h2 class="events__name">${name.slice(0, 30)}${name.length > 30 && '...'}</h2>
              <p class="events__date">${localDate}</p>
              <p class="events__nameOfThePlace">${nameOfThePlace}</p>
          </li>`
    }).join('')

    renderPaginal(ticketmasterAPI.page)

  } catch (error) {
    Report.failure(
      'Error',
      'Sorry, no matches were found. Try a new search or use our suggestions.',
      'Okay'
    );
    console.error(error);
  }
}

eventsList.addEventListener('click', openModal)

function openModal({ target }) {
  if (target.nodeName === 'UL') {
    return
  }

  let data = null

  if (target.nodeName === 'LI') {
    data = target.dataset.list;
  } else {
    data = target.parentNode.dataset.list;
  }
  const parce = JSON.parse(decodeURIComponent(data))
  backdrop.classList.remove('is-hidden')
  const { name, previewImgUrl, info, localDate, localTime, timezone, nameOfCity,
    nameOfCountry, minPrice, maxPrice, currency, buyTicketUrl } = parce;

  const modalHtml = `
  <div class="modal__closeWrapp">
    <img class="modal__close" width="24" height="24" src="${iconClose}" alt="">
  </div>
  <img class="modal__img" src="${previewImgUrl}" alt="${name}" width="100" height="100px">
  <div class="modal__firstWrapp">
    <img class="modal__bigImg" src="${previewImgUrl}" alt="${name}" width="100" height="100px">
    <div class="">
      <div class="modal__info modal__div">
        <h2>INFO</h2>
        <p>${info}</p>
      </div>
      <div class="modal__timeDate modal__div">
        <h2>WHEN</h2>
        <p>${localDate}</p>
        <p>${localTime} (${timezone})</p>
      </div>
      <div class="modal__location-desktop modal__div">
        <h2>WHERE</h2>
        <p>${nameOfCity}, ${nameOfCountry}</p>
      </div>
    </div>
  </div>
  <div class="modal__afterWhereWrapp">
    <div class="modal__location-tablet modal__div">
        <h2>WHERE</h2>
        <p>${nameOfCity}, ${nameOfCountry}</p>
      </div>
    <div class="modal__name modal__div">
       <h2>WHO</h2>
       <p>${name}</p>
     </div>
    <div class="modal__price modal__div" price>
     <h2 class="modal__priceTitle">PRICES</h2>
     <div class="modal__standartPrice modal__div">
       <div class="modal__priceWrapp">
         ${iconBarcodeSVG}
         <p class="priceText">Standart ${minPrice} ${currency}</p>
       </div>
       <button class="modal__standartBtn modal__button">
        <a class="modal__buyLink link" href="${buyTicketUrl}">BUY TICKETS</a>
       </button>
     </div>
     <div class="modal__vipPrice modal__div">
       <div class="modal__priceWrapp">
         ${iconBarcodeSVG}
         <p class="priceText">VIP ${maxPrice} ${currency}</p>
       </div>
      <button class="modal__button">
        <a class="modal__buyLink link" href="${buyTicketUrl}">BUY TICKETS</a>
      </button>
     </div>
    </div>
    <button class="modal__buttonMore modal__button">MORE FROM THIS AUTHOR</button>
  </div>`

  modalEl.innerHTML = modalHtml

  const btnMore = document.querySelector('.modal__buttonMore')

  btnMore.addEventListener('click', (e) => {
    e.preventDefault()

    ticketmasterAPI.searchQuery = name;
    renderBaseMarkup();
    closeModal(e)
  })

  const closeBtn = document.querySelector('.modal__closeWrapp')

  document.body.style.overflow = 'hidden';
  modalEl.addEventListener('wheel', preventScroll);

  closeBtn.addEventListener('click', closeModal)
  document.addEventListener('keydown', closeModal)
  document.addEventListener('click', closeModal)

  function closeModal(e) {
    if (e.target === backdrop ||
      e.currentTarget === closeBtn ||
      e.currentTarget === btnMore ||
      e.code === "Escape") {
      backdrop.classList.add('is-hidden')
      document.removeEventListener('keydown', closeModal)
      document.removeEventListener('click', closeModal)

      document.body.style.overflow = '';
      modalEl.removeEventListener('wheel', preventScroll);
    }
  }
}



function preventScroll(event) {
  event.stopPropagation();
}
function renderPaginal(ticketPage) {

  const currentPage = Number(ticketPage)
  let btnsArr = []


  if (totalPages === 1) {
    pagesEl.innerHTML = '';
    return;
  }

  for (let i = 1; i <= totalPages; i++) {
    btnsArr.push(`<button class="paginalBtn ${currentPage === i || currentPage === 0 && i === 1 ? 'activePage' : ''}">${i}</button>`)
  }
  if (totalPages <= 5 && totalPages > 0) {
    pagesEl.innerHTML = btnsArr.join('');
  } else if (totalPages > 0) {
    if (currentPage >= totalPages - 3) {
      pagesEl.innerHTML =
        btnsArr[0] +
        '...' +
        btnsArr[currentPage - 1] +
        btnsArr[currentPage - 2] +
        btnsArr.slice(currentPage, currentPage + 3).join('');
    } else if (currentPage > 0 && currentPage < 2) {
      pagesEl.innerHTML =
        btnsArr[currentPage - 1] +
        btnsArr.slice(currentPage, currentPage + 2).join('') +
        '...' +
        btnsArr[totalPages - 1];
    } else if (currentPage === 2) {
      pagesEl.innerHTML =
        btnsArr[0] +
        btnsArr[currentPage - 1] +
        btnsArr.slice(currentPage, currentPage + 2).join('') +
        '...' +
        btnsArr[totalPages - 1];
    } else if (currentPage > 2) {
      const list = currentPage !== 3 ? btnsArr[0] +
        '...' +
        btnsArr[currentPage - 2] +
        btnsArr[currentPage - 1] +
        btnsArr.slice(currentPage, currentPage + 1).join('') +
        '...' +
        btnsArr[totalPages - 1] : btnsArr[0] +
        btnsArr[currentPage - 2] +
        btnsArr[currentPage - 1] +
        btnsArr.slice(currentPage, currentPage + 1).join('') +
        '...' +
      btnsArr[totalPages - 1];
      pagesEl.innerHTML = list
    } else {

      pagesEl.innerHTML =
        btnsArr.slice(currentPage, currentPage + 3).join('') +
        '...' +
        btnsArr[totalPages - 1];
    }
  } else {
    pagesEl.innerHTML =
      btnsArr.slice(currentPage, currentPage + 3).join('') +
      '...' +
      btnsArr[totalPages - 1];
  }
}

function fetchAnotherPage(e) {
  e.preventDefault()
  if (e.target.nodeName !== 'BUTTON') {
    return
  }
  ticketmasterAPI.page = e.target.textContent
  renderBaseMarkup();
}

function renderCountries(arr) {
  const html = arr.map(({ code, name }) => {
    return `
      <li class="option list">
        <input type="radio" class="radio" name="category" id="${code}">
        <label for="${code}">${name}</label>
      </li>`
  }).join('')
  countriesList.innerHTML = `
  <li class="option list">
        <input type="radio" class="radio" name="category" id="none">
        <label for="none">Choose country</label>
      </li>
  ${html}`;
  chooseCountry()
}
