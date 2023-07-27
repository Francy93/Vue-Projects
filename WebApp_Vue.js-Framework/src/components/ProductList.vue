<template>
    <main>
       <!-- START showcase -->

			<div id="carousel-cards" class="carousel slide" data-ride="carousel" :key="carouselCards">

			<!-- START search results -->
				<div class="found-cards" v-if="searchOn">
					<div v-for="(card, index) in showcase" :key="index" class="col-xs-12 col-sm-4 col-md-4">
						<div class="card wrap">
							<div class="card front">
								<img class="img"	v-bind:src="card.image">
								<h2  class="title"	v-text="card.title"></h2>
							</div>
							
							<div class="card back">
								<img class="img"	v-bind:src="card.image">
								<div class="info container">
									<div class="description">
										<p class="location"	>Location: {{card.location}}</p>
										<p class="price"	>Price: {{card.price}}£</p>
										<p class="space"	>Spaces: {{card.spaces}}</p>
									</div>
									<img class="logo"	v-bind:src="card.logo">
								</div>
								<button v-if="canAddToCart(card)" class="btn btn-primary" type="button" v-on:click="addToCart(card)">ADD TO CART</button>
								<button v-else disabled="disabled" class="btn btn-primary" type="button">ADD TO CART</button>
							</div> 
						</div>							
					</div>
				</div>
			<!-- END search results -->


			<!-- START carousel -->
				<div id="cards" v-else>
					<!-- Indicators -->
			        <ol class='carousel-indicators'><li data-target='#carousel-cards' data-slide-to='0' class='active'></li><li data-target='#carousel-cards' data-slide-to='1'></li></ol>

                    <!-- Carousel -->	
                        
                    <div class="carousel-inner" role="listbox">
                        
                        <div class="item active">

                            <div v-for="index in 6" :key="index" class="col-xs-12 col-sm-4 col-md-4">
                                <div class="card wrap">
                                    <div class="card front">
                                        <img class="img"	v-bind:src="showcase[index+0-1].image">
                                        <h2  class="title"	v-text="showcase[index+0-1].title"></h2>
                                    </div>
                                    
                                    <div class="card back">
                                        <img class="img"	v-bind:src="showcase[index+0-1].image">
                                        <div class="info container">
                                            <div class="description">
                                                <p class="location"	>Location: {{showcase[index+0-1].location}}</p>
                                                <p class="price"	>Price: {{showcase[index+0-1].price}}£</p>
                                                <p class="space"	>Spaces: {{showcase[index+0-1].spaces}}</p>
                                            </div>
                                            <img class="logo"	v-bind:src="showcase[index+0-1].logo">
                                        </div>
                                        <button v-if="canAddToCart(showcase[index+0-1])" class="btn btn-primary" type="button" v-on:click="addToCart(showcase[index+0-1])">ADD TO CART</button>
                                        <button v-else disabled="disabled" class="btn btn-primary" type="button">ADD TO CART</button>
                                    </div> 
                                </div>							
                            </div>

                        </div>


                    <!-- nex carousel page -->
                        <div class="item ">

                            <div v-for="index in 4" :key="index" class="col-xs-12 col-sm-4 col-md-4">
                                <div class="card wrap">
                                    <div class="card front">
                                        <img class="img"	v-bind:src="showcase[index+6-1].image">
                                        <h2  class="title"	v-text="showcase[index+6-1].title"></h2>
                                    </div>
                                    
                                    <div class="card back">
                                        <img class="img"	v-bind:src="showcase[index+6-1].image">
                                        <div class="info container">
                                            <div class="description">
                                                <p class="location"	>Location: {{showcase[index+6-1].location}}</p>
                                                <p class="price"	>Price: {{showcase[index+6-1].price}}£</p>
                                                <p class="space"	>Spaces: {{showcase[index+6-1].spaces}}</p>
                                            </div>
                                            <img class="logo"	v-bind:src="showcase[index+6-1].logo">
                                        </div>
                                        <button v-if="canAddToCart(showcase[index+6-1])" class="btn btn-primary" type="button" v-on:click="addToCart(showcase[index+6-1])">ADD TO CART</button>
                                        <button v-else disabled="disabled" class="btn btn-primary" type="button">ADD TO CART</button>
                                    </div> 
                                </div>							
                            </div>

                        </div>


                    <!-- end carousel page -->
                    </div>
                
                                
                    <!-- Controls -->
                        
                    <a href="#carousel-cards" class="left carousel-control" role="button" data-slide="prev">
                        <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
                    </a>
                    <a href="#carousel-cards" class="right carousel-control" role="button" data-slide="next">
                        <span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
                    </a>
				</div>
			<!-- END carousel -->

			</div>
			
		<!-- END showcase -->
    </main>
</template>



<script>
    export default {
        name: "ProductList",

        props: ['showcase', 'carouselCards', 'searchOn', 'canAddToCart'],
        data() { return {}; },
        created(){
            console.log("Loading carousel...")
        },
        mounted(){
            console.log("Loading Loaded!")
        },
        methods: {
            addToCart(product) {
                this.$emit('addToCart', product);
            }
        }
    };
</script>
