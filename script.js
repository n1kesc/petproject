function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

// const todoListHtml = document.getElementById('todoList');
// const button = document.querySelector('.submit-button');
// const input = document.querySelector('.input-text');

// let list = [
//     { id: 0, text: 'Test todo 1' },
//     { id: 1, text: 'Test todo 2' },
// ];

// const removeTodo = (todoId) => {
//     let element = todoListHtml.querySelector(`[data-id="${todoId}"]`);
//     if (element) {
//         element.remove();
//         list = list.filter((el) => el.id !== todoId);
//     }
// }


// button.addEventListener('click', (e) => {
//     let newTodo = input.value;
//     let id = list.length;
//     list = [{ id: id, text: newTodo }, ...list];
//     todoListHtml.insertAdjacentHTML("beforeend", `
//         <div data-id="${id}">
//             ${newTodo}
//             <button onclick="removeTodo(${id})">remove</button>
//         </div>
//     `);
//     input.value = '';
// });

// list.forEach(el => todoListHtml.insertAdjacentHTML("beforeend", `
//     <div data-id="${el.id}">
//         ${el.text}
//         <button onclick="removeTodo(${el.id})">remove</button>
//     </div>
// `));

(async function() {
    const productsList = document.getElementById('products_list');
    const select = document.getElementById('layout');
    const filter = document.getElementById('filters');
    const minPrice = document.querySelector('.price-filter__min-price');
    const maxPrice = document.querySelector('.price-filter__max-price');
    const search = document.querySelector('.item-search');
    const resetFiltersBtn = document.querySelector('.reset-filters')
    
    
    select.addEventListener('change', (e) => {
        productsList.dataset.layout = select.value;
        if (select.value === 'grid3') {
            productsList.classList.remove('list');
            productsList.classList.add('grid3');
        } else if (select.value === 'list') {
            productsList.classList.remove('grid3');
            productsList.classList.add('list');
        } else {
            productsList.classList.remove('list');
            productsList.classList.remove('grid3');
        }
    });

    const data = await fetch('https://dummyjson.com/products').then(res => res.json());
    const products = shuffle(data.products);

    // insert products in product list container
    for (let i = 0; i < products.length; i++) {
        const { discountPercentage, price } = products[i]; // { price:..., discountPercentage:... }
        //const [firstElement, secondElement] = [1, 2];

        if (discountPercentage !== 0) {
            products[i].oldPrice = Math.round(price / (1 - discountPercentage / 100));
        }

        let priceHtml = `<div class="product_item__price-origin">${price}$</div>`;
        if (products[i].oldPrice) {
            priceHtml = `
                <div class="product_item__price-old">${products[i].oldPrice}$</div>
                <div class="product_item__price-sale">${price}$</div>
            `;
        }

        // let priceHtml = products[i].oldPrice ? `
        //     <div class="product_item__price-old">${products[i].oldPrice}$</div>
        //     <div class="product_item__price-sale">${products[i].price}$</div>
        // ` : `
        //     <div class="product_item__price-origin">${products[i].price}$</div>
        // `;

        productsList.insertAdjacentHTML("beforeend", `
            <div class="product_item ${products[i].category} visible" data-id="${products[i].id}">
                <img src="${products[i].thumbnail}" class="product_item--thumbnail" alt="${products[i].title}">
                <a href="#" class="product_item--cat">${products[i].category}</a>
                <div class="product_item--title">${products[i].title}</div>
                <div class="product_item--descr">${products[i].description}</div>
                <div class="product_item-inner">
                    <div class="product_item__price">${priceHtml}</div>
                    <button class="product_item--button" data-id="${products[i].id}">add to card</button>
                </div>
            </div>
        `);
    }

    const productItems = productsList.querySelectorAll('.product_item');
    const categories = [...Array.from(new Set(products.map(p => p.category)))];

    // categories.forEach(cat => {
    //     filter.insertAdjacentHTML('beforeend', `<option value="${cat}">${cat}</option>`)
    // })

    for (let i = 0; i < categories.length; i++) {
        const opt = document.createElement('option');
        opt.value = categories[i];
        opt.innerHTML = categories[i];
        filter.appendChild(opt);
    }

    // filter.addEventListener('change', (e) => {
    //     if (filter.value === 'all') {
    //         Array.from(productsList.children).forEach(item => item.dataset.visible = true);
    //         return;
    //     }
    //     const item = productsList.getElementsByClassName('.product_item');
    //     Array.from(productsList.children).forEach(item => {
    //         if (item.classList.contains(filter.value)) {
    //             item.dataset.visible = true;
    //         } else {
    //             item.dataset.visible = false;
    //         }
    //     })
    // });

    const setFilterCategory = (cat) => {
        for (let i = 0; i < productItems.length; i++) {
            let product = productItems[i];
            if (cat === 'all') {
                product.classList.add('visible');
            } else if (product.classList.contains(cat)) {
                product.classList.add('visible');
            } else {
                product.classList.remove('visible');
            }
        }
        filter.value = cat;
    }

    filter.addEventListener('change', () => {
        setFilterCategory(filter.value);
    });

    /*
        TODO:
            сделать так, что бы при клике на категорию в продукте фильтр становился этой категорией
    */

    const itemCats = productsList.querySelectorAll('.product_item--cat');
    itemCats.forEach(cat => {
        cat.addEventListener('click', (event) => {
            event.preventDefault();
            if (filter.value === cat.innerText) {
                setFilterCategory('all')
            } else {
                setFilterCategory(cat.innerText)
            }
        });
    });


    minPrice.addEventListener('keyup', (e) => {
        let minValue = parseInt(minPrice.value);
        for (let i = 0; i < productItems.length; i++) {
            let product = productItems[i];
            let productPrice = parseInt(product.querySelector('.product_item__price').innerText);
            if (productPrice < minValue) {
                productItems[i].classList.add('--underprice');
            } else {
                productItems[i].classList.remove('--underprice');
            }
        }
    });

    maxPrice.addEventListener('keyup', (e) => {
        let maxValue = parseInt(maxPrice.value);
        for (let i = 0; i < productItems.length; i++) {
            let product = productItems[i];
            let productPrice = parseInt(product.querySelector('.product_item__price').innerText);
            if (productPrice > maxValue) {
                productItems[i].classList.add('--overprice');
            } else {
                productItems[i].classList.remove('--overprice');
            }
        }
    });

    search.addEventListener('keyup', (e) => {
        let searchRequest = search.value.toLowerCase();
        for (let i = 0; i < productItems.length; i++) {
            let product = productItems[i];
            let productText = product.textContent.toLowerCase();
            if (productText.includes(searchRequest)) {
                product.classList.remove('--search-hide');
            } else {
                product.classList.add('--search-hide');
            }
        }
    });

    /*
        сделать кнопку add to card, при нажатии на неё добавлять продукт в массив, выводить массив в консоль лог
    */

    const addButtons = document.querySelectorAll('.product_item--button');

    let cartArray = [];
    addButtons.forEach(addButton => {
        addButton.addEventListener('click', () => {
            let productId = parseInt(addButton.dataset.id);
            // let product = products.find(p => p.id === productId);
            // if (product) cartArray.push(product)
            for (let i = 0; i < products.length; i++) {
                if (productId === products[i].id) {
                    cartArray.push(products[i]);
                    console.log(cartArray)
                    break;
                }
            }
        });
    });

    // TODO: сделать clear filters кнопку под фильтрами
    const resetFilters = () => {
        minPrice.value = '';
        maxPrice.value = '';
        search.value = '';
        filter.value = 'all';
        productItems.forEach(productItem => {
            productItem.classList.add('visible');
            productItem.classList.remove('--overprice');
            productItem.classList.remove('--underprice');
            productItem.classList.remove('--search-hide');
        });
    }

    resetFiltersBtn.addEventListener('click', resetFilters);
    
})();

