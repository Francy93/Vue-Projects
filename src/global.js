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
		path = path.length == 1 && Array.isArray(path[0])? path[0]: path;

		//higher scope variables not recursively defined
		let pivot = "", mid = 0, l = 0, r = length-1, way;

		//getting the element through a specified path (...path)
		function getElement(index){
			let e = arr[index]; 
			for(let i=0; i<path.length; i++){
				let p = !isNaN(parseInt(path[i])) && path[i] >= 0? parseInt(path[i]): 0;
				e = p<e.length? e[p]: [];
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

