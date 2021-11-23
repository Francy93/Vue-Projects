'use strict';


/**
 * Array QuickSort
 * @param {array} arr 
 * @param {boolean} mode 
 * @param {?number[]} path 
 * @returns {array} sorted array
 */
function quickSort(arr, mode, ...path){
	length = arr.length;

	if(length > 0){
		arr = [...arr]; // cloning array
		mode = mode == null? true: mode;
		path = path.length === 1 && Array.isArray(path[0])? path[0]: path;

		//higher scope variables not recursively defined
		let pivot = "", mid = 0, l = 0, r = length-1, way;

		//getting the element through a specified path (...path)
		function getElement(index){
			let e = arr[index]; 
			for(let i=0; i<path.length; i++){
				let p = !isNaN(parseInt(path[i])) && path[i] >= 0? parseInt(path[i]): 0;
				e = p<e.length? e[p]: (typeof e === 'object' && p<Object.entries(e).length? Object.entries(e)[p]: []);
		  	}
			return e;
		}

		//recursive lambda function
		(function recur(left, right){

			l = left, r = right;
			mid = Math.floor( (l+r) / 2 );

			//getting the pivot
			pivot = getElement(mid);
			// partition
			while (l <= r) {
				// loop left index if the element is lower than expetd
				do way = mode? l++: r--;
				while (getElement(way) < pivot);
				// loop right index if the element is higher than expetd
				do way = mode? r--: l++;
				while (getElement(way) > pivot);

				if (--l <= ++r) {
					let tmp = arr[l];
					arr[l++] = arr[r];
					arr[r--] = tmp;
				}
			}
			// recursion
			if (left < r ) recur(left, r );
			if (l < right) recur(l, right);
		})(l,r);
	}

	return arr;
}


/**
 * Generating the carousel
 * @param {number} length 
 * @returns {string}
 */
function carouselGen(length){
	length = !isNaN(parseInt(length)) && parseInt(length) > 0? parseInt(length): vueApp.showcase.length;
	const pageSize = 6;

	function pageGen(num, mode){
		mode = mode? "active": "";
		const index = Math.ceil((num / pageSize) - 1) * pageSize;
		const cycles = (num % pageSize) > 0? (num % pageSize): pageSize; 

		return `
			<div class="item ${mode}">

				<div v-for="index in ${cycles}" :key="index" class="col-xs-12 col-sm-4 col-md-4">
					<div class="card wrap">
						<div class="card front">
							<img class="img"	v-bind:src="showcase[index+${index}-1].image">
							<h2  class="title"	v-text="showcase[index+${index}-1].title"></h2>
						</div>
						
						<div class="card back">
							<img class="img"	v-bind:src="showcase[index+${index}-1].image">
							<div class="info container">
								<div class="description">
									<p class="location"	>Location: {{showcase[index+${index}-1].location}}</p>
									<p class="price"	>Price: {{showcase[index+${index}-1].price}}£</p>
									<p class="space"	>Spaces: {{showcase[index+${index}-1].spaces}}</p>
								</div>
								<img class="logo"	v-bind:src="showcase[index+${index}-1].logo">
							</div>
							<button v-if="canAddToCart(index+${index}-1)" class="btn btn-primary" type="button" v-on:click="addToCart(index+${index}-1)">ADD TO CART</button>
							<button v-else disabled="disabled" class="btn btn-primary" type="button">ADD TO CART</button>
						</div> 
					</div>							
				</div>

			</div>


		`;
	}

	function indicators(){
		
		let indicators = "<ol class='carousel-indicators'>";

		for(let i=0; i<Math.ceil(length/pageSize); i++){
			indicators += `<li data-target='#carousel-cards' data-slide-to='${i}'${ i==0?" class='active'": ""}></li>`;
		}

		return indicators + "\n</ol>"; 
	}

	function pages(){
		let pages = "";

		do{
			var i = typeof i == 'undefined'? pageSize: i + pageSize;
			pages += pageGen(i<=length?i: length, i<=pageSize) + "<!-- nex carousel page -->";
		}while(i < length);

		return pages;
	}
	

	let carousel =`
		<div class="carousel-inner" role="listbox">
			${pages()}
		</div>
	`;
	
	let controls =`
		<a href="#carousel-cards" class="left carousel-control" role="button" data-slide="prev">
			<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
		</a>
		<a href="#carousel-cards" class="right carousel-control" role="button" data-slide="next">
			<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
		</a>
	`;

	let output =`
		<!-- Indicators -->
			${indicators()}

		<!-- Carousel -->	
			${carousel}
					
		<!-- Controls -->
			${controls}
	`;

	return output;
}