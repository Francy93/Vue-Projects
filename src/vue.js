/* 'use strict'; */

var vueApp = new Vue({
    el: '#app',
    data: {
		
        // array of JSON objects
        products: [],
		showcase: [],
        cart:[],
    	sitename: 'After School Club',
		cartOn: false,
		searchOn: false,
		carouselCards: 0,
    },


	// selfrunning method which starts before the page has loaded
	created(){
		console.log("Loading page...")

		this.products = products.slice();
		this.showcase = this.products.slice();

		this.includeCarousel();
	},

	// selfrunning method which starts after the page has successfully loaded
	mounted(){
		console.log("Page loaded!");
	},

	computed:{
		/**
		 * Getting the cart total price
		 * @return {number}
		 */
		getTotal(){
			let total = 0;
			for(let item of this.cart){
				total += this.getProductById(item.id).price * item.qty;
			}
			return total;
		},
	},

    methods:{

		cartButton(){
			this.cartOn = this.cart.length > 0? !this.cartOn: false;
		},
		
        /**
         * Validate input to get "product" object from "Products" array
         * @param {number|object} elem 
         * @returns {number}
         */
        validInput: function(elem){
            if(typeof(elem) == "object" || typeof(elem) == "number"){
                 if(typeof(elem) == "object")		return 1;
                else if(typeof(elem) == "number")	return 2;
            }else return 0;
        },

        /**
         * Get "product" object from "showcase" array by index or object
         * @param {number|object} elem 
         * @returns {boolean|object}
         */
        getProduct: function(elem){
            switch(this.validInput(elem)){
                case 1: return elem;				// object case
                case 2: return this.showcase[elem];	// number case
                default: console.log("Wrong getProduct() parameter!");
                        return false;				// wrong value case
            }
        },

        /**
         * Get "product" object from the "Products" array by id
         * @param {number} id 
         * @returns {boolean|object}
         */
        getProductById(id){
            for(let i=0; i<this.products.length; i++){
                if(this.products[i].id == id) return this.products[i];
            }
            return false;
        },

        /**
         * Find product in the cart by id
         * @param {number} id 
         * @returns {number}
         */
        findInCart(id){
            let qty = 0;
            for(const elem of this.cart){
                if(elem.id == id){
                    qty = elem.qty;
                    break;
                }
            }
            return qty;
        },

        /**
         * Remove a product from the cart
         * @param {number} id 
         * @returns {boolean}
         */
        removeFromCart(id){
            for(let i=0; i<this.cart.length; i++){
                if(this.cart[i].id == id){
                    this.cart.splice(i,1);
                    return true;
                }
            }

            //if the id is not found then return false
            return false;
        },

        /**
         * Set quantity in of a product in the cart
         * @param {number} id 
         * @param {boolean|number} way 
         * @returns {boolean}
         */
        setInCart(id, way){
            let cartElem;

            for(let i=0; i<this.cart.length; i++){
                if(this.cart[i].id == id){
                    const product = this.getProductById(id);
                    if(!Number.isInteger(way)){
                        if(way){
                            if(product.spaces > 0){
                                this.cart[i].qty++;
                                product.spaces--;
                            }else return false;
                        }else{
                            if(this.cart[i].qty > 0){
                                this.cart[i].qty--;
                                product.spaces++;
                            }else return false;
                        }
                    }else{
                        if(way >= 0 && way <= product.spaces){
                            product.spaces	 = product.spaces + this.cart[i].qty - way;
                            this.cart[i].qty = way;
                            
                        }else return false;
                    }

                    cartElem = this.cart[i];
                	break;
                }
            }

            //checking wether an element is removable from the cart array
            if(cartElem.qty <= 0) this.removeFromCart(cartElem.id);
            return true;
        },

        /**
         * Add a new product into the cart
         * @param {number|object} elem 
         * @returns {boolean}
         */
        addToCart: function(elem){
            const product = this.getProduct(elem);

            if(product){
                let id = product.id;

                if(this.findInCart(id) > 0) return this.setInCart(id, true);
                else{
                    this.cart.push({id:id, qty:1});
                    product.spaces--;
                }

                return true;
            }else return false;
        },

        /**
         * Check wether a product can be added into the cart
         * @param {number|object} elem 
         * @returns {boolean}
         */
        canAddToCart: function(elem){
            const product = this.getProduct(elem);
            return product? product.spaces > 0: false;
        },
		

		includeCarousel(num){
			num = !isNaN(parseInt(num))? parseInt(num): false;

			const carouselElem = document.getElementById("cards");
			carouselElem.innerHTML = carouselGen(num? num: this.showcase.length);
			this.carouselCards += 1;
		},

		/**
		 * Sorting this.products array
		 * @param {string} path 
		 * @param {string} mode 
		 */
		productSort(path, mode){
			mode = mode == "ascend"? true: false;

			switch(path.toLowerCase()){
				case "subject":		path = [1, 1];
					break;
				case "location":	path = [2, 1];
					break;
				case "price":		path = [3, 1];
					break;
				case "spaces":		path = [6, 1];
					break;
				default:			path = [0, 1];
			} 
			
			this.showcase = quickSort(this.showcase, mode, path);
			this.products = quickSort(this.products, mode, path);
		},


		// searching method
		search(){
			const value = document.getElementById("search").value;
			this.showcase	= [];

			if (!(/^\s*$/.test(value))){
				this.searchOn = true;
			
				for(var i=0; i<this.products.length; i++){
					let counter = 0;
					
					if(value.length < 2){
						for(let k=0; k < (this.products[i].title.length + this.products[i].location.length); k++){
							if(value.toLowerCase() === this.products[i].title.charAt(k).toLowerCase() ||
								value.toLowerCase() === this.products[i].location.charAt(k).toLowerCase()){
								for (let j = 0; j < this.showcase.length; j++){
									if (this.products[i].id === this.showcase[j].id) counter++;
								}
								if (counter == 0) this.showcase.push(this.products[i]);
							}
						}
					}else {
						if(value.toLowerCase() === this.products[i].title.substr(0, value.length).toLowerCase() ||
							value.toLowerCase() === this.products[i].location.substr(0, value.length).toLowerCase()){
								this.showcase.push(this.products[i]);
						}
					}
				}
			}else{
				this.showcase = this.products.slice();
				this.searchOn = false;
				this.carouselCards += 1;
			}
		}


    },
});