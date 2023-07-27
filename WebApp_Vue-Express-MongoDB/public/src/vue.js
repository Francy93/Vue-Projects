
var vueApp;			// Vue variable
var prodList = []; 	// list of products

/**
 * Initialising array of products
 * @param {array} response 
 */
function initProduct(response){
	prodList = JSON.parse(response);
	startVue();
}

/**
 * Generating the carousel into the html file
 * @param {number} response 
 */
function includeCarousel(response){
	const carouselElem = document.getElementById("cards");
	carouselElem.innerHTML = carouselGen(response);

	// init array of products
	ajax("list", initProduct, "get", "lessons");
}

// getting quantity of element to generate the caruosel
ajax("amount", includeCarousel, "get", "lessons");






// Vue function
function startVue(){
	vueApp = new Vue({
		el: '#app',
		data: {
			// array of JSON objects
			products: [],
			showcase: [],
			cart:[],
			/* email: "",
			password: "", */
			sitename: "ShopNow",
			cartOn: false,
			searchOn: false,
			carouselCards: 0,
		},


		// selfrunning method which starts before the page has loaded
		created(){
			console.log("Loading page...")

			this.products = prodList.slice();
			this.showcase = this.products.slice();

			/* function getUser(response){
				vueApp.user = JSON.parse(response).user[0].email;
				vueApp.password = JSON.parse(response).user[0].password;
			}

			await ajax("user", getUser, "get", "user"); */
		},

		// selfrunning method which starts after the page has successfully loaded
		mounted(){
			//setting html title
			document.getElementsByTagName("head")[0].getElementsByTagName("title")[0].innerHTML = this.sitename;

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
				elem = !isNaN(parseInt(elem))? parseInt(elem): elem;

				switch(this.validInput(elem)){
					case 1: return elem;				// object case
					case 2: return this.showcase[elem];	// number case
					default: console.log("Wrong getProduct(?) parameter!");
							return false;				// wrong value case
				}
			},

			/**
			 * Get "product" object from the "Products" array by id
			 * @param {number} id 
			 * @returns {boolean|object}
			 */
			getProductById(id){
				for(const product of this.products){
					if(product.id == id) return product;
				}
				return false;
			},

			/**
			 * Find product in the cart by id
			 * @param {number} id 
			 * @returns {number|boolean}
			 */
			findInCart(elem){
				elem = !isNaN(parseInt(elem))? parseInt(elem): elem;
				let id, qty = 0;

				switch(this.validInput(elem)){
					case 1: id = elem.id;							// object case
						break;
					case 2: 										// number case
						if(this.getProductById(elem)){
							id = elem;
							break;
						}
					default: console.log("Wrong findInCart(?) parameter!");
						return false;							// wrong value case
				}
				
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
							if(way >= 0 &&  way <= product.spaces + this.cart[i].qty){
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
					const id = product.id;

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


			/**
			 * Sorting this.products array
			 * @param {string} path 
			 * @param {string} mode 
			 */
			productSort(attr, mode){
				// stopping the execution of this method if the showcase array is empty
				if(!Array.isArray(this.showcase) || !this.showcase.length) return;

				mode			= mode.toLowerCase() == "ascend";
				attr			= attr.toLowerCase();
				
				// getting the index of the relevant attribute
				let index		= a => Object.entries(this.showcase[0]).findIndex(e => e[0] === a);
				const path		= [index(attr) > -1? index(attr): 0, 1];
				
				this.showcase	= quickSort(this.showcase, mode, path);
				this.products	= quickSort(this.products, mode, path);
			},


			// searching method
			async search(){
				// stopping the execution of this method if the product array is empty
				if(!Array.isArray(this.products) || !this.products.length) return;

				const value = document.getElementById("search").value.toLowerCase();

				if (!(/^\s*$/.test(value))){
					this.searchOn		= true;
					this.showcase		= [];

					// sending a query
					let response		= await ajax(value, "", "get", "search");
					response			= isJSON(response)? JSON.parse(response): response;

					// handling server response if any otherwise perform a local search
					if(Array.isArray(response) && response.length > 0){
						this.showcase	= this.products.filter(pro => { for(const res of response) if(res.id == pro.id) return true; })
						return;
					}

					
					for(let product of this.products){
						const title		= product.title.toLowerCase();
						const location	= product.location.toLowerCase();
						
						if(value.length < 2){
							const longest = title.length > location.length? title.length: location.length;

							for(let i=0; i<longest; i++){
								if(value === title.charAt(i) || value === location.charAt(i)){
									// checking whether a product has been already added to the showcase array
									for(var j=0; j<this.showcase.length; j++){
										if(product.id === this.showcase[j].id)	break;
									}
									if(j == this.showcase.length)	this.showcase.push(product);
								}
							}
						}else if(value==title.substr(0,value.length) || value==location.substr(0,value.length)){
							this.showcase.push(product);
						}
					}
				}else{
					this.showcase		= this.products.slice();
					this.searchOn		= false;
					this.carouselCards += 1;
				}
			}

		},
	});
}	