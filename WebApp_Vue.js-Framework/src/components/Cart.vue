
<template>
<!-- START cart container -->

    <div id="cart-container" v-if="cartOn">

    <!-- START shopping cart -->
        <div class="shopping-cart">
        <!--START shopping-cart-header -->
            <div class="shopping-cart-header">
                <i class="fa fa-shopping-cart cart-icon"></i><span class="badge">{{cart.length}}</span>
                <div class="shopping-cart-total">
                    <span class="lighter-text">Total:</span>
                    <span class="main-color-text">£{{getTotal}}</span>
                </div>
            </div>
        <!--END shopping-cart-header -->
            
            
        <!--START cart content -->
            <div id="cart-items">
            <!--START empty cart -->
                <div v-if="cart.length <= 0" class="empty-cart">
                    <div class="card-header">
                        <h3>Cart</h3>
                    </div>
                    <div class="card-body cart">
                        <div class="col-sm-12 empty-cart-cls text-center"> <img src="https://mdx-shopnow.herokuapp.com/assets/emptyCart.png" width="130" height="130" class="img-fluid mb-4 mr-3">
                            <h3><strong>Your Cart is Empty</strong></h3>
                            <h4>Add something to make me happy :)</h4> 
                        </div>
                    </div>
                    <a href="#" @click="cartButton()" class="btn btn-primary cart-btn-transform m-3" data-abc="true">continue shopping</a>
                </div>
            <!--END empty cart -->
            
            <!--START cart cards -->
                <li v-else v-for="(product, index) in cart" :key="index" class="clearfix">
                    <img v-bind:src="getProductById(product.id).logo" />
                    <div class="cart-data">
                        <span class="item-name">{{getProductById(product.id).title}}</span>
                        <div class="quantity">
                            <span class="item-quantity">Quantity:	{{product.qty}}</span>
                            <div>
                                <button @click="setInCart(product.id, false)"> - </button>
                                <button @click="setInCart(product.id, true )"> + </button>
                            </div>
                        </div>
                        <div class="lighter-text">Price: <span class="item-price">£{{getProductById(product.id).price * product.qty}}</span></div>
                    </div>
                </li>
            <!--END cart cards -->
            </div>
        <!--END cart content -->
            
        </div>
    <!--END shopping-cart -->


    <!-- START ceckout -->
        <div class="checkout-container">
            <form name= "checkoutForm" id="checkoutForm" action="#" onsubmit="return false" method="post">    <!-- A form is used to submit data -->
                <div class = "wrapper in"> 
                    <div class="group">
                        <input type="text" name="Name" onfocusout="validateForm(this)" required="required"/><span class="highlight"></span><span class="bar"></span>
                        <label>Your Name</label>
                    </div>
                    <br><br>  
                    <div class="group">
                        <input type="tel" name="Telephone" onfocusout="validateForm(this)" required="required"/><span class="highlight"></span><span class="bar"></span>
                        <label>Your phone number</label>
                    </div>     
                </div>
                <div class="buttonwrap">
                    <button v-if="cart.length > 0" id="checkoutButton" type="submit"  @click="validateForm()" form="checkoutForm" class="btn btn-primary button checkout-button" value="Sign-In">Checkout</button>
                    <button v-else disabled type="submit"  @click="validateForm()" form="checkoutForm" class="btn btn-primary button checkout-button" value="Sign-In">Checkout</button>
                </div>
            </form>
        </div>
    <!-- END checkout -->
    </div>

<!--END cart container -->
</template>


<script>
    export default {
        name: "Form",

        props: ['cart', 'cartOn', 'getTotal', 'getProductById'],

        methods: {
            setInCart(product, way) {
                this.$emit('setInCart', product, way)
            },
            cartButton() {
                this.$emit('cartButton')
            },

                        
            /**
             * Checking out the cart
             * @param {array} data 
             * @returns string
             */
            async checkout(data){
                const date = new Date();

                const orderData = {
                    name        : data.Name,
                    phone       : data.Telephone,
                    price       : this.getTotal,
                    products    : this.cart,

                    date: {
                        year    : date.getFullYear(),
                        month   : date.getMonth()+1,
                        day     : date.getDate(),            
                        hour    : date.getHours(),
                        minutes : date.getMinutes(),
                        seconds : date.getSeconds()
                    }
                }

                async function callBack(response){
                    if(isNaN(response)){
                        for(const item of orderData.products){
                            const spaces = await ajax({id: item.id}, x => JSON.parse(x).spaces, "get", "https://mdx-shopnow.herokuapp.com/mongoDB/products/findOne");
                            await ajax([{id: item.id}, {"$set": {spaces: spaces - item.qty}}], "", "patch", "https://mdx-shopnow.herokuapp.com/mongoDB/products/findOneAndUpdate");
                        }
                        alert("Checkout successfully completed!\r\nReloading simulation..");
                        location.reload();
                    }else alert("I'm sorry, something went wrong!\r\nError: ", response);
                }

                return await ajax(orderData, callBack, "post", "https://mdx-shopnow.herokuapp.com/mongoDB/orders/insertOne");
            },

            /**
            * here will be checked and validate any type of data entered into the forms
            * @param  {Object}  element DOM element (form or input)
            * @return {Boolean} Boolean which determines the form submission
            */
            validateForm(){
                const element = document.getElementById("checkoutButton");
                
                if(element.tagName != "BUTTON"){ //if just a focus-out of the inputBox
                        const validate = new Validation(element);
                        const result = validate.inputs();
                        return result;
                }else if(this.cart.length > 0){                          //if the button as been presse
                    const elemForm = element.form;
                    const validate = new Validation(elemForm, true);
                    const TorF = validate.inputs();
                    TorF? this.checkout(validate.getData()): console.log("void button");

                }else alert("Sorry, you cannot checkout an empty cart!");
                return false; 
            },
        }
    };
</script>