<script lang="ts">
	import { onMount } from 'svelte';
	import type { SortingState, ComparisonResult, SortStats, ArrayBar, SortingAlgorithm } from '$lib/types';
	import { algorithmInfo } from '$lib/types';

	let state: SortingState = {
		algorithm: 'bubble',
		array: [],
		stats: {
			startTime: null,
			endTime: null,
			comparisons: 0,
			swaps: 0
		},
		currentIndices: [],
		isSorted: false,
		primary: {
			algorithm: 'bubble',
			array: [],
			stats: {
				startTime: null,
				endTime: null,
				comparisons: 0,
				swaps: 0
			},
			currentIndices: [],
			isSorted: false
		},
		secondary: {
			algorithm: 'quick',
			array: [],
			stats: {
				startTime: null,
				endTime: null,
				comparisons: 0,
				swaps: 0
			},
			currentIndices: [],
			isSorted: false
		},
		viewMode: 'single',
		isRunning: false,
		showResults: false,
		speed: 50,
		arraySize: 50,
		theme: 'dark'
	};

	const algorithms: SortingAlgorithm[] = [
		'bubble',
		'quick',
		'merge',
		'insertion',
		'selection',
		'heap',
		'shell',
		'cocktail',
		'gnome',
		'comb',
		'cycle',
		'pancake',
		'counting',
		'radix'
	];
	
	function generateArray(size: number): ArrayBar[] {
		return Array.from({ length: size }, () => ({
			value: Math.floor(Math.random() * 100) + 1,
			isComparing: false,
			isSwapping: false,
			isSorted: false
		}));
	}

	function sleep(ms: number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	function resetStats(sortState: { stats: SortStats }) {
		sortState.stats = {
			comparisons: 0,
			swaps: 0,
			startTime: null,
			endTime: null,
			isWinner: undefined
		};
	}

	function generateInsights(result: ComparisonResult): string[] {
		const insights: string[] = [];
		const { winner, timeDifference, percentageDifference, primary, secondary } = result;
		
		insights.push(`${winner} Sort was faster by ${timeDifference.toFixed(2)}ms (${percentageDifference.toFixed(1)}%)`);
		
		// Add practical use case recommendations
		if (state.arraySize < 50) {
			insights.push("For small arrays (< 50 elements):");
			insights.push("- Insertion Sort is often fastest due to low overhead");
			insights.push("- Quick Sort may be overkill due to recursion overhead");
		} else if (state.arraySize < 100) {
			insights.push("For medium arrays (50-100 elements):");
			insights.push("- Quick Sort becomes more efficient");
			insights.push("- Merge Sort guarantees consistent performance");
		} else {
			insights.push("For large arrays (> 100 elements):");
			insights.push("- Quick Sort, Merge Sort, and Heap Sort show their strengths");
			insights.push("- Avoid Bubble and Insertion Sort due to quadratic complexity");
		}

		// Add performance comparison
		if (primary.comparisons !== secondary.comparisons) {
			const compDiff = Math.abs(primary.comparisons - secondary.comparisons);
			insights.push(`Comparison operations: ${state.primary.algorithm} (${primary.comparisons}) vs ${state.secondary.algorithm} (${secondary.comparisons})`);
			insights.push(`- Difference of ${compDiff} comparisons can impact CPU cache performance`);
		}
		
		if (primary.swaps !== secondary.swaps) {
			const swapDiff = Math.abs(primary.swaps - secondary.swaps);
			insights.push(`Memory operations: ${state.primary.algorithm} (${primary.swaps} swaps) vs ${state.secondary.algorithm} (${secondary.swaps} swaps)`);
			insights.push(`- Difference of ${swapDiff} swaps affects memory write operations`);
		}

		// Add theoretical vs practical comparison
		insights.push("\nTheoretical vs Practical Performance:");
		insights.push(`${state.primary.algorithm} Sort: ${algorithmInfo[state.primary.algorithm as SortingAlgorithm].timeComplexity}`);
		insights.push(`${state.secondary.algorithm} Sort: ${algorithmInfo[state.secondary.algorithm as SortingAlgorithm].timeComplexity}`);
		
		return insights;
	}

	function compareResults(primary: { algorithm: string, stats: SortStats }, secondary: { algorithm: string, stats: SortStats }): ComparisonResult {
		const primaryTime = primary.stats.endTime! - primary.stats.startTime!;
		const secondaryTime = secondary.stats.endTime! - secondary.stats.startTime!;
		
		const winner = primaryTime <= secondaryTime ? primary.algorithm : secondary.algorithm;
		const timeDifference = Math.abs(primaryTime - secondaryTime);
		const percentageDifference = (timeDifference / Math.max(primaryTime, secondaryTime)) * 100;

		primary.stats.isWinner = primaryTime <= secondaryTime;
		secondary.stats.isWinner = secondaryTime < primaryTime;

		const insights = [];
		if (Math.abs(percentageDifference) > 50) {
			insights.push(`${winner} Sort was significantly faster (${percentageDifference.toFixed(1)}% difference)`);
		}
		if (primary.stats.comparisons !== secondary.stats.comparisons) {
			const moreComparisons = primary.stats.comparisons > secondary.stats.comparisons ? primary.algorithm : secondary.algorithm;
			insights.push(`${moreComparisons} Sort made more comparisons`);
		}
		if (primary.stats.swaps !== secondary.stats.swaps) {
			const moreSwaps = primary.stats.swaps > secondary.stats.swaps ? primary.algorithm : secondary.algorithm;
			insights.push(`${moreSwaps} Sort performed more swaps`);
		}

		return {
			winner,
			timeDifference,
			percentageDifference,
			primary: primary.stats,
			secondary: secondary.stats,
			insights
		};
	}

	async function bubbleSort(arr: ArrayBar[], stats: SortStats, isPrimary: boolean) {
		stats.startTime = performance.now();
		const n = arr.length;
		
		for (let i = 0; i < n - 1; i++) {
			for (let j = 0; j < n - i - 1; j++) {
				if (!state.isRunning) return;
				
				stats.comparisons++;
				arr[j].isComparing = true;
				arr[j + 1].isComparing = true;
				if (state.viewMode === 'compare') {
					updateArray(arr, isPrimary);
				} else {
					updateArray(arr, isPrimary);
				}
				
				await sleep(state.speed);
				
				if (arr[j].value > arr[j + 1].value) {
					stats.swaps++;
					
					arr[j].isSwapping = true;
					arr[j + 1].isSwapping = true;
					if (state.viewMode === 'compare') {
						updateArray(arr, isPrimary);
					} else {
						updateArray(arr, isPrimary);
					}
					
					await sleep(state.speed);
					
					const temp = arr[j];
					arr[j] = arr[j + 1];
					
					arr[j + 1] = temp;
				}
				
				arr[j].isComparing = false;
				arr[j + 1].isComparing = false;
				
				arr[j].isSwapping = false;
				arr[j + 1].isSwapping = false;
			}
			arr[n - i - 1].isSorted = true;
			if (state.viewMode === 'compare') {
				updateArray(arr, isPrimary);
			} else {
				updateArray(arr, isPrimary);
			}
		}
		arr[0].isSorted = true;
		if (state.viewMode === 'compare') {
			updateArray(arr, isPrimary);
		} else {
			updateArray(arr, isPrimary);
		}
		stats.endTime = performance.now();
	}

	async function quickSort(arr: ArrayBar[], stats: SortStats, isPrimary: boolean) {
		stats.startTime = performance.now();
		
		async function partition(low: number, high: number): Promise<number> {
			const pivot = arr[high].value;
			let i = low - 1;
			
			// Highlight pivot
			arr[high].isComparing = true;
			updateArray(arr, isPrimary);
			await sleep(state.speed);
			
			for (let j = low; j < high; j++) {
				if (!state.isRunning) return i + 1;
				
				// Highlight current element being compared
				arr[j].isComparing = true;
				updateArray(arr, isPrimary);
				await sleep(state.speed);
				
				stats.comparisons++;
				if (arr[j].value < pivot) {
					i++;
					// Highlight swap
					arr[i].isSwapping = true;
					arr[j].isSwapping = true;
					updateArray(arr, isPrimary);
					await sleep(state.speed);
					
					stats.swaps++;
					const temp = { ...arr[i] };
					arr[i] = { ...arr[j] };
					arr[j] = temp;
					
					// Show swap result
					updateArray(arr, isPrimary);
					await sleep(state.speed);
					
					arr[i].isSwapping = false;
					arr[j].isSwapping = false;
				}
				arr[j].isComparing = false;
			}
			
			// Final pivot swap
			arr[high].isComparing = false;
			arr[i + 1].isSwapping = true;
			arr[high].isSwapping = true;
			updateArray(arr, isPrimary);
			await sleep(state.speed);
			
			stats.swaps++;
			const temp = { ...arr[i + 1] };
			arr[i + 1] = { ...arr[high] };
			arr[high] = temp;
			
			arr[i + 1].isSwapping = false;
			arr[high].isSwapping = false;
			arr[i + 1].isSorted = true;
			updateArray(arr, isPrimary);
			
			return i + 1;
		}
		
		async function sort(low: number, high: number) {
			if (low < high && state.isRunning) {
				const pi = await partition(low, high);
				await sort(low, pi - 1);
				await sort(pi + 1, high);
			} else if (low === high) {
				arr[low].isSorted = true;
				updateArray(arr, isPrimary);
			}
		}
		
		await sort(0, arr.length - 1);
		stats.endTime = performance.now();
	}

	async function mergeSort(arr: ArrayBar[], stats: SortStats, isPrimary: boolean) {
		stats.startTime = performance.now();
		
		async function merge(left: number, middle: number, right: number) {
			const n1 = middle - left + 1;
			const n2 = right - middle;
			
			// Create temporary arrays with copies of the bars
			const L: ArrayBar[] = Array.from({ length: n1 }, (_, i) => ({
				...arr[left + i],
				isComparing: false,
				isSwapping: false,
				isSorted: false
			}));
			const R: ArrayBar[] = Array.from({ length: n2 }, (_, i) => ({
				...arr[middle + 1 + i],
				isComparing: false,
				isSwapping: false,
				isSorted: false
			}));
			
			let i = 0, j = 0, k = left;
			
			while (i < n1 && j < n2 && state.isRunning) {
				// Highlight comparison
				arr[left + i].isComparing = true;
				arr[middle + 1 + j].isComparing = true;
				updateArray(arr, isPrimary);
				await sleep(state.speed);
				
				stats.comparisons++;
				if (L[i].value <= R[j].value) {
					arr[k].isSwapping = true;
					updateArray(arr, isPrimary);
					await sleep(state.speed);
					
					stats.swaps++;
					arr[k] = { ...L[i], isSwapping: true };
					updateArray(arr, isPrimary);
					await sleep(state.speed);
					
					arr[k].isSwapping = false;
					arr[k].isSorted = true;
					i++;
				} else {
					
					arr[k].isSwapping = true;
					updateArray(arr, isPrimary);
					await sleep(state.speed);
					
					stats.swaps++;
					arr[k] = { ...R[j], isSwapping: true };
					updateArray(arr, isPrimary);
					await sleep(state.speed);
					
					arr[k].isSwapping = false;
					arr[k].isSorted = true;
					j++;
				}
				
				
				arr[left + i - 1]?.isComparing && (arr[left + i - 1].isComparing = false);
				arr[middle + 1 + j - 1]?.isComparing && (arr[middle + 1 + j - 1].isComparing = false);
				updateArray(arr, isPrimary);
				k++;
			}
			
			// Copy remaining elements
			while (i < n1 && state.isRunning) {
				arr[k].isSwapping = true;
				updateArray(arr, isPrimary);
				await sleep(state.speed);
				
				stats.swaps++;
				arr[k] = { ...L[i], isSwapping: true };
				updateArray(arr, isPrimary);
				await sleep(state.speed);
				
				arr[k].isSwapping = false;
				arr[k].isSorted = true;
				updateArray(arr, isPrimary);
				i++;
				k++;
			}
			
			while (j < n2 && state.isRunning) {
				arr[k].isSwapping = true;
				updateArray(arr, isPrimary);
				await sleep(state.speed);
				
				stats.swaps++;
				arr[k] = { ...R[j], isSwapping: true };
				updateArray(arr, isPrimary);
				await sleep(state.speed);
				
				arr[k].isSwapping = false;
				arr[k].isSorted = true;
				updateArray(arr, isPrimary);
				j++;
				k++;
			}
		}
		
		async function sort(left: number, right: number) {
			if (left < right && state.isRunning) {
				const middle = Math.floor((left + right) / 2);
				await sort(left, middle);
				await sort(middle + 1, right);
				await merge(left, middle, right);
			} else if (left === right) {
				arr[left].isSorted = true;
				updateArray(arr, isPrimary);
			}
		}
		
		await sort(0, arr.length - 1);
		stats.endTime = performance.now();
	}

	async function insertionSort(arr: ArrayBar[], stats: SortStats, isPrimary: boolean) {
		stats.startTime = performance.now();
		const n = arr.length;
		
		// Mark first element as sorted
		arr[0].isSorted = true;
		updateArray(arr, isPrimary);
		
		for (let i = 1; i < n && state.isRunning; i++) {
			const key = { ...arr[i] };
			let j = i - 1;
			
			// Highlight current element being inserted
			arr[i].isComparing = true;
			updateArray(arr, isPrimary);
			await sleep(state.speed);
			
			while (j >= 0 && state.isRunning) {
				// Highlight comparison
				arr[j].isComparing = true;
				updateArray(arr, isPrimary);
				await sleep(state.speed);
				
				stats.comparisons++;
				if (arr[j].value > key.value) {
					// Highlight swap
					arr[j].isSwapping = true;
					arr[j + 1].isSwapping = true;
					updateArray(arr, isPrimary);
					await sleep(state.speed);
					
					stats.swaps++;
					arr[j + 1] = arr[j];
					
					// Show the swap
					updateArray(arr, isPrimary);
					await sleep(state.speed);
					
					arr[j].isSwapping = false;
					arr[j + 1].isSwapping = false;
					j--;
				} else {
					arr[j].isComparing = false;
					break;
				}
				arr[j + 1].isComparing = false;
			}
			
			// Place the key in its correct position
			arr[j + 1] = { ...key, isSorted: true };
			arr[i].isComparing = false;
			updateArray(arr, isPrimary);
			await sleep(state.speed);
		}
		
		// Mark all elements as sorted
		for (let i = 0; i < n; i++) {
			arr[i].isSorted = true;
		}
		updateArray(arr, isPrimary);
		stats.endTime = performance.now();
	}

	async function selectionSort(arr: ArrayBar[], stats: SortStats, isPrimary: boolean) {
		stats.startTime = performance.now();
		const n = arr.length;
		
		for (let i = 0; i < n - 1 && state.isRunning; i++) {
			let minIdx = i;
			
			// Highlight current minimum
			arr[minIdx].isComparing = true;
			updateArray(arr, isPrimary);
			await sleep(state.speed);
			
			// Find the minimum element in unsorted portion
			for (let j = i + 1; j < n && state.isRunning; j++) {
				// Highlight comparison
				arr[j].isComparing = true;
				updateArray(arr, isPrimary);
				await sleep(state.speed);
				
				stats.comparisons++;
				if (arr[j].value < arr[minIdx].value) {
					arr[minIdx].isComparing = false;
					minIdx = j;
				} else {
					arr[j].isComparing = false;
				}
				updateArray(arr, isPrimary);
			}
			
			if (minIdx !== i) {
				// Highlight swap
				arr[i].isSwapping = true;
				arr[minIdx].isSwapping = true;
				updateArray(arr, isPrimary);
				await sleep(state.speed);
				
				stats.swaps++;
				const temp = arr[i];
				arr[i] = arr[minIdx];
				arr[minIdx] = temp;
				
				arr[i].isSwapping = false;
				arr[minIdx].isSwapping = false;
			}
			
			// Mark current position as sorted
			arr[i].isSorted = true;
			arr[i].isComparing = false;
			if (minIdx !== i) arr[minIdx].isComparing = false;
			updateArray(arr, isPrimary);
			await sleep(state.speed);
		}
		
		// Mark last element as sorted
		arr[n - 1].isSorted = true;
		updateArray(arr, isPrimary);
		stats.endTime = performance.now();
	}

	async function heapSort(arr: ArrayBar[], stats: SortStats, isPrimary: boolean) {
		stats.startTime = performance.now();
		const n = arr.length;
		
		async function heapify(n: number, i: number) {
			let largest = i;
			const left = 2 * i + 1;
			const right = 2 * i + 2;
			
			// Highlight nodes being compared
			arr[i].isComparing = true;
			if (left < n) arr[left].isComparing = true;
			if (right < n) arr[right].isComparing = true;
			updateArray(arr, isPrimary);
			await sleep(state.speed);
			
			stats.comparisons += 2;
			if (left < n && arr[left].value > arr[largest].value) {
				largest = left;
			}
			if (right < n && arr[right].value > arr[largest].value) {
				largest = right;
			}
			
			// Remove comparison highlighting
			arr[i].isComparing = false;
			if (left < n) arr[left].isComparing = false;
			if (right < n) arr[right].isComparing = false;
			
			if (largest !== i && state.isRunning) {
				// Highlight swap
				arr[i].isSwapping = true;
				arr[largest].isSwapping = true;
				updateArray(arr, isPrimary);
				await sleep(state.speed);
				
				stats.swaps++;
				const temp = arr[i];
				arr[i] = arr[largest];
				arr[largest] = temp;
				
				// Show swap result
				arr[i].isSwapping = false;
				arr[largest].isSwapping = false;
				updateArray(arr, isPrimary);
				await sleep(state.speed);
				
				await heapify(n, largest);
			}
		}
		
		// Build heap
		for (let i = Math.floor(arr.length / 2) - 1; i >= 0 && state.isRunning; i--) {
			await heapify(arr.length, i);
		}
		
		// Extract elements from heap
		for (let i = arr.length - 1; i > 0 && state.isRunning; i--) {
			// Highlight swap
			arr[0].isSwapping = true;
			arr[i].isSwapping = true;
			updateArray(arr, isPrimary);
			await sleep(state.speed);
			
			stats.swaps++;
			const temp = arr[0];
			arr[0] = arr[i];
			arr[i] = temp;
			
			arr[0].isSwapping = false;
			arr[i].isSwapping = false;
			arr[i].isSorted = true;
			updateArray(arr, isPrimary);
			await sleep(state.speed);
			
			await heapify(i, 0);
		}
		
		arr[0].isSorted = true;
		updateArray(arr, isPrimary);
		stats.endTime = performance.now();
	}

	async function shellSort(arr: ArrayBar[], stats: SortStats, isPrimary: boolean) {
		stats.startTime = performance.now();
		const n = arr.length;
		
		// Generate gap sequence (using Shell's original sequence)
		let gap = Math.floor(n / 2);
		
		while (gap > 0 && state.isRunning) {
			for (let i = gap; i < n; i++) {
				const temp = { ...arr[i] };
				let j = i;
				
				// Highlight current element
				arr[i].isComparing = true;
				updateArray(arr, isPrimary);
				await sleep(state.speed);
				
				while (j >= gap && state.isRunning) {
					// Highlight comparison
					arr[j - gap].isComparing = true;
					updateArray(arr, isPrimary);
					await sleep(state.speed);
					
					stats.comparisons++;
					if (arr[j - gap].value > temp.value) {
						// Highlight swap
						arr[j].isSwapping = true;
						arr[j - gap].isSwapping = true;
						updateArray(arr, isPrimary);
						await sleep(state.speed);
						
						stats.swaps++;
						arr[j] = { ...arr[j - gap] };
						
						// Show swap result
						updateArray(arr, isPrimary);
						await sleep(state.speed);
						
						arr[j].isSwapping = false;
						arr[j - gap].isSwapping = false;
						j -= gap;
					} else {
						arr[j - gap].isComparing = false;
						break;
					}
				}
				
				arr[j] = temp;
				arr[i].isComparing = false;
				
				// Mark elements as sorted when gap is 1
				if (gap === 1) {
					arr[j].isSorted = true;
				}
				updateArray(arr, isPrimary);
			}
			gap = Math.floor(gap / 2);
		}
		
		// Mark all elements as sorted
		for (let i = 0; i < n; i++) {
			arr[i].isSorted = true;
		}
		updateArray(arr, isPrimary);
		stats.endTime = performance.now();
	}

	async function cocktailSort(arr: ArrayBar[], stats: SortStats, isPrimary: boolean) {
		stats.startTime = performance.now();
		let start = 0;
		let end = arr.length - 1;
		let swapped = true;
		
		while (swapped && state.isRunning) {
			swapped = false;
			
			// Forward pass (like bubble sort)
			for (let i = start; i < end; i++) {
				// Highlight comparison
				arr[i].isComparing = true;
				arr[i + 1].isComparing = true;
				updateArray(arr, isPrimary);
				await sleep(state.speed);
				
				stats.comparisons++;
				if (arr[i].value > arr[i + 1].value) {
					// Highlight swap
					arr[i].isSwapping = true;
					arr[i + 1].isSwapping = true;
					updateArray(arr, isPrimary);
					await sleep(state.speed);
					
					stats.swaps++;
					const temp = { ...arr[i] };
					arr[i] = { ...arr[i + 1] };
					arr[i + 1] = temp;
					swapped = true;
					
					// Show swap result
					updateArray(arr, isPrimary);
					await sleep(state.speed);
					
					arr[i].isSwapping = false;
					arr[i + 1].isSwapping = false;
				}
				arr[i].isComparing = false;
				arr[i + 1].isComparing = false;
			}
			
			// Mark the last element as sorted
			arr[end].isSorted = true;
			end--;
			
			if (!swapped) break;
			swapped = false;
			
			// Backward pass
			for (let i = end; i >= start; i--) {
				// Highlight comparison
				arr[i].isComparing = true;
				arr[i + 1].isComparing = true;
				updateArray(arr, isPrimary);
				await sleep(state.speed);
				
				stats.comparisons++;
				if (arr[i].value > arr[i + 1].value) {
					// Highlight swap
					arr[i].isSwapping = true;
					arr[i + 1].isSwapping = true;
					updateArray(arr, isPrimary);
					await sleep(state.speed);
					
					stats.swaps++;
					const temp = { ...arr[i] };
					arr[i] = { ...arr[i + 1] };
					arr[i + 1] = temp;
					swapped = true;
					
					// Show swap result
					updateArray(arr, isPrimary);
					await sleep(state.speed);
					
					arr[i].isSwapping = false;
					arr[i + 1].isSwapping = false;
				}
				arr[i].isComparing = false;
				arr[i + 1].isComparing = false;
			}
			
			// Mark the first element as sorted
			arr[start].isSorted = true;
			start++;
		}
		
		// Mark remaining elements as sorted
		for (let i = start; i <= end; i++) {
			arr[i].isSorted = true;
		}
		updateArray(arr, isPrimary);
		stats.endTime = performance.now();
	}

	async function gnomeSort(arr: ArrayBar[], stats: SortStats, isPrimary: boolean) {
		stats.startTime = performance.now();
		let pos = 0;
		
		while (pos < arr.length && state.isRunning) {
			// Highlight current position
			arr[pos].isComparing = true;
			updateArray(arr, isPrimary);
			await sleep(state.speed);
			
			if (pos === 0 || arr[pos].value >= arr[pos - 1].value) {
				arr[pos].isComparing = false;
				arr[pos].isSorted = true;
				pos++;
			} else {
				// Highlight swap
				arr[pos].isSwapping = true;
				arr[pos - 1].isSwapping = true;
				updateArray(arr, isPrimary);
				await sleep(state.speed);
				
				stats.swaps++;
				const temp = { ...arr[pos] };
				arr[pos] = { ...arr[pos - 1] };
				arr[pos - 1] = temp;
				
				// Show swap result
				updateArray(arr, isPrimary);
				await sleep(state.speed);
				
				arr[pos].isSwapping = false;
				arr[pos - 1].isSwapping = false;
				arr[pos].isComparing = false;
				
				pos--;
			}
			stats.comparisons++;
		}
		
		// Mark all elements as sorted
		for (let i = 0; i < arr.length; i++) {
			arr[i].isSorted = true;
		}
		updateArray(arr, isPrimary);
		stats.endTime = performance.now();
	}

	async function combSort(arr: ArrayBar[], stats: SortStats, isPrimary: boolean) {
		stats.startTime = performance.now();
		const n = arr.length;
		let gap = n;
		let shrink = 1.3;
		let sorted = false;

		while (!sorted && state.isRunning) {
			// Update gap
			gap = Math.floor(gap / shrink);
			if (gap <= 1) {
				gap = 1;
				sorted = true;
			}

			for (let i = 0; i + gap < n; i++) {
				// Highlight comparison
				arr[i].isComparing = true;
				arr[i + gap].isComparing = true;
				updateArray(arr, isPrimary);
				await sleep(state.speed);

				stats.comparisons++;
				if (arr[i].value > arr[i + gap].value) {
					// Highlight swap
					arr[i].isSwapping = true;
					arr[i + gap].isSwapping = true;
					updateArray(arr, isPrimary);
					await sleep(state.speed);

					stats.swaps++;
					const temp = { ...arr[i] };
					arr[i] = { ...arr[i + gap] };
					arr[i + gap] = temp;
					sorted = false;

					arr[i].isSwapping = false;
					arr[i + gap].isSwapping = false;
				}
				arr[i].isComparing = false;
				arr[i + gap].isComparing = false;

				if (gap === 1) {
					arr[i].isSorted = true;
				}
				updateArray(arr, isPrimary);
			}
		}

		// Mark all elements as sorted
		for (let i = 0; i < n; i++) {
			arr[i].isSorted = true;
		}
		updateArray(arr, isPrimary);
		stats.endTime = performance.now();
	}

	async function cycleSort(arr: ArrayBar[], stats: SortStats, isPrimary: boolean) {
		stats.startTime = performance.now();
		const n = arr.length;

		for (let cycleStart = 0; cycleStart < n - 1 && state.isRunning; cycleStart++) {
			let item = arr[cycleStart];
			let pos = cycleStart;

			// Find where to put the item
			for (let i = cycleStart + 1; i < n && state.isRunning; i++) {
				arr[i].isComparing = true;
				item.isComparing = true;
				updateArray(arr, isPrimary);
				await sleep(state.speed);

				if (arr[i].value < item.value) {
					pos++;
				}
				stats.comparisons++;

				arr[i].isComparing = false;
				item.isComparing = false;
				updateArray(arr, isPrimary);
			}

			// If item is already in correct position, move to next
			if (pos === cycleStart) {
				arr[pos].isSorted = true;
				updateArray(arr, isPrimary);
				continue;
			}

			// Find correct position for item
			while (item.value === arr[pos].value && pos < n && state.isRunning) {
				pos++;
			}

			// Put the item to its right position
			if (pos !== cycleStart && state.isRunning) {
				item.isSwapping = true;
				arr[pos].isSwapping = true;
				updateArray(arr, isPrimary);
				await sleep(state.speed);

				let temp = arr[pos];
				arr[pos] = item;
				item = temp;
				stats.swaps++;

				item.isSwapping = false;
				arr[pos].isSwapping = false;
				arr[pos].isSorted = true;
				updateArray(arr, isPrimary);
			}

			// Rotate rest of the cycle
			while (pos !== cycleStart && state.isRunning) {
				pos = cycleStart;
				
				// Find where to put the item
				for (let i = cycleStart + 1; i < n && state.isRunning; i++) {
					arr[i].isComparing = true;
					item.isComparing = true;
					updateArray(arr, isPrimary);
					await sleep(state.speed);

					if (arr[i].value < item.value) {
						pos++;
					}
					stats.comparisons++;

					arr[i].isComparing = false;
					item.isComparing = false;
					updateArray(arr, isPrimary);
				}

				// Find correct position if there are duplicates
				while (item.value === arr[pos].value && pos < n && state.isRunning) {
					pos++;
				}

				// Put the item to its right position
				if (item.value !== arr[pos].value && state.isRunning) {
					item.isSwapping = true;
					arr[pos].isSwapping = true;
					updateArray(arr, isPrimary);
					await sleep(state.speed);

					let temp = arr[pos];
					arr[pos] = item;
					item = temp;
					stats.swaps++;

					item.isSwapping = false;
					arr[pos].isSwapping = false;
					arr[pos].isSorted = true;
					updateArray(arr, isPrimary);
				}
			}
		}

		// Mark remaining elements as sorted
		for (let i = 0; i < n && state.isRunning; i++) {
			if (!arr[i].isSorted) {
				arr[i].isSorted = true;
				updateArray(arr, isPrimary);
				await sleep(state.speed / 2);
			}
		}

		stats.endTime = performance.now();
	}

	async function pancakeSort(arr: ArrayBar[], stats: SortStats, isPrimary: boolean) {
			stats.startTime = performance.now();
			const n = arr.length;

			async function flip(k: number) {
				let left = 0;
				let right = k;

				while (left < right && state.isRunning) {
					// Highlight swap
					arr[left].isSwapping = true;
					arr[right].isSwapping = true;
					updateArray(arr, isPrimary);
					await sleep(state.speed);

					stats.swaps++;
					const temp = { ...arr[left] };
					arr[left] = { ...arr[right] };
					arr[right] = temp;

					arr[left].isSwapping = false;
					arr[right].isSwapping = false;
					left++;
					right--;
				}
			}

			for (let curr_size = n; curr_size > 1 && state.isRunning; curr_size--) {
				// Find the maximum element in arr[0..curr_size-1]
				let max_idx = 0;
				for (let i = 0; i < curr_size; i++) {
					arr[i].isComparing = true;
					arr[max_idx].isComparing = true;
					updateArray(arr, isPrimary);
					await sleep(state.speed);

					stats.comparisons++;
					if (arr[i].value > arr[max_idx].value) {
						arr[max_idx].isComparing = false;
						max_idx = i;
					} else {
						arr[i].isComparing = false;
					}
				}

				// Move the maximum element to end of current subarray
				if (max_idx !== curr_size - 1) {
					// First flip: bring maximum element to beginning
					if (max_idx !== 0) {
						await flip(max_idx);
					}
					// Second flip: bring maximum element to its final position
					await flip(curr_size - 1);
				}

				// Mark the current position as sorted
				arr[curr_size - 1].isSorted = true;
				updateArray(arr, isPrimary);
			}

			// Mark first element as sorted
			arr[0].isSorted = true;
			updateArray(arr, isPrimary);
			stats.endTime = performance.now();
		}

		async function countingSort(arr: ArrayBar[], stats: SortStats, isPrimary: boolean) {
			stats.startTime = performance.now();
			const n = arr.length;
			
			// Create a copy of the original array
			const workingArray = arr.map(bar => ({ ...bar }));
			
			// Find max value for counting array size
			const max = Math.max(...workingArray.map(bar => bar.value));
			const count = new Array(max + 1).fill(0);
			
			// Count occurrences
			for (let i = 0; i < n && state.isRunning; i++) {
				workingArray[i].isComparing = true;
				arr[i] = { ...workingArray[i] };
				updateArray(arr, isPrimary);
				await sleep(state.speed);
				
				count[workingArray[i].value]++;
				stats.comparisons++;
				
				workingArray[i].isComparing = false;
				arr[i] = { ...workingArray[i] };
				updateArray(arr, isPrimary);
			}
			
			// Calculate cumulative count
			for (let i = 1; i <= max; i++) {
				count[i] += count[i - 1];
			}
			
			// Build output array
			const output = new Array(n).fill(null).map(() => ({ ...workingArray[0] }));
			
			for (let i = n - 1; i >= 0 && state.isRunning; i--) {
				const currentValue = workingArray[i].value;
				const position = count[currentValue] - 1;
				
				// Highlight movement
				workingArray[i].isSwapping = true;
				arr[i] = { ...workingArray[i] };
				updateArray(arr, isPrimary);
				await sleep(state.speed);
				
				output[position] = {
					...workingArray[i],
					isSwapping: false,
					isSorted: true
				};
				
				count[currentValue]--;
				stats.swaps++;
				
				// Update visualization
				for (let j = 0; j < n; j++) {
					if (output[j]) {
						arr[j] = { ...output[j] };
					}
				}
				updateArray(arr, isPrimary);
				await sleep(state.speed);
			}
			
			// Copy final sorted array back
			for (let i = 0; i < n; i++) {
				arr[i] = { ...output[i], isSorted: true };
			}
			updateArray(arr, isPrimary);
			
			stats.endTime = performance.now();
		}

		async function radixSort(arr: ArrayBar[], stats: SortStats, isPrimary: boolean) {
			stats.startTime = performance.now();
			const n = arr.length;

			// Find the maximum number to know number of digits
			let max = arr[0].value;
			for (let i = 1; i < n; i++) {
				if (arr[i].value > max) {
					max = arr[i].value;
				}
			}

			// Do counting sort for every digit
			for (let exp = 1; Math.floor(max / exp) > 0 && state.isRunning; exp *= 10) {
				const output: ArrayBar[] = new Array(n).fill(null).map(() => ({
					value: 0,
					isComparing: false,
					isSwapping: false,
					isSorted: false
				}));
				const count = new Array(10).fill(0);

				// Store count of occurrences
				for (let i = 0; i < n && state.isRunning; i++) {
					arr[i].isComparing = true;
					updateArray(arr, isPrimary);
					await sleep(state.speed);
					
					const digit = Math.floor(arr[i].value / exp) % 10;
					count[digit]++;
					stats.comparisons++;
					
					arr[i].isComparing = false;
					updateArray(arr, isPrimary);
				}

				// Change count[i] so that count[i] contains actual
				// position of this digit in output[]
				for (let i = 1; i < 10; i++) {
					count[i] += count[i - 1];
				}

				// Build the output array
				for (let i = n - 1; i >= 0 && state.isRunning; i--) {
					const digit = Math.floor(arr[i].value / exp) % 10;
					
					arr[i].isSwapping = true;
					updateArray(arr, isPrimary);
					await sleep(state.speed);
					
					output[count[digit] - 1] = { ...arr[i] };
					count[digit]--;
					stats.swaps++;
					
					arr[i].isSwapping = false;
					updateArray(arr, isPrimary);
				}

				// Copy the output array to arr[]
				for (let i = 0; i < n && state.isRunning; i++) {
					arr[i] = { ...output[i], isComparing: true };
					updateArray(arr, isPrimary);
					await sleep(state.speed);
					arr[i].isComparing = false;
				}
				updateArray(arr, isPrimary);
			}

			// Mark all elements as sorted
			for (let i = 0; i < n && state.isRunning; i++) {
				arr[i].isSorted = true;
				updateArray(arr, isPrimary);
				await sleep(state.speed / 2);
			}

			stats.endTime = performance.now();
		}

		async function runSort(sortState: { algorithm: SortingAlgorithm, array: ArrayBar[], stats: SortStats }, isPrimary: boolean): Promise<ArrayBar[]> {
			console.log(`Running ${sortState.algorithm} sort, isPrimary: ${isPrimary}`);
			const arr = [...sortState.array];  // Create a copy of the array
			resetStats(sortState);
			
			try {
				switch (sortState.algorithm) {
					case 'bubble':
						await bubbleSort(arr, sortState.stats, isPrimary);
						break;
					case 'quick':
						await quickSort(arr, sortState.stats, isPrimary);
						break;
					case 'merge':
						await mergeSort(arr, sortState.stats, isPrimary);
						break;
					case 'insertion':
						await insertionSort(arr, sortState.stats, isPrimary);
						break;
					case 'selection':
						await selectionSort(arr, sortState.stats, isPrimary);
						break;
					case 'heap':
						await heapSort(arr, sortState.stats, isPrimary);
						break;
					case 'shell':
						await shellSort(arr, sortState.stats, isPrimary);
						break;
					case 'cocktail':
						await cocktailSort(arr, sortState.stats, isPrimary);
						break;
					case 'gnome':
						await gnomeSort(arr, sortState.stats, isPrimary);
						break;
					case 'comb':
						await combSort(arr, sortState.stats, isPrimary);
						break;
					case 'cycle':
						await cycleSort(arr, sortState.stats, isPrimary);
						break;
					case 'pancake':
						await pancakeSort(arr, sortState.stats, isPrimary);
						break;
					case 'counting':
						await countingSort(arr, sortState.stats, isPrimary);
						break;
					case 'radix':
						await radixSort(arr, sortState.stats, isPrimary);
						break;
					default:
						console.error('Unknown sorting algorithm:', sortState.algorithm);
						break;
				}
				
				console.log(`${sortState.algorithm} sort completed, stats:`, sortState.stats);
				if(isPrimary) {
					state.primary.stats = sortState.stats;
				} else {
					state.secondary.stats = sortState.stats;
				} 
				return arr;
			} catch (error) {
				console.error(`Error in ${sortState.algorithm} sort:`, error);
				throw error;
			}
		}

		async function startSorting() {
			console.log('Starting sort process...');
			console.log('Current view mode:', state.viewMode);
			
			if (state.isRunning) {
				console.log('Sort already running, returning');
				return;
			}
			
			state.isRunning = true;
			state.showResults = false;
			
			if (state.viewMode === 'compare') {
				console.log('Starting compare mode sort');
				try {
					// Create separate arrays for each sort with identical values
					const baseArray = generateArray(state.arraySize);
					state.primary.array = baseArray.map(bar => ({ ...bar }));
					state.secondary.array = baseArray.map(bar => ({ ...bar }));
					
					// Initialize stats
					state.primary.stats = {
						startTime: null,
						endTime: null,
						comparisons: 0,
						swaps: 0,
						isWinner: undefined
					};
					state.secondary.stats = {
						startTime: null,
						endTime: null,
						comparisons: 0,
						swaps: 0,
						isWinner: undefined
					};

					console.log('Starting parallel sorts');
					const [primaryResult, secondaryResult] = await Promise.all([
							runSort({
								algorithm: state.primary.algorithm as SortingAlgorithm,
								array: state.primary.array,
								stats: state.primary.stats
							}, true),
							runSort({
								algorithm: state.secondary.algorithm as SortingAlgorithm,
								array: state.secondary.array,
								stats: state.secondary.stats
							}, false)
					]);

					// Update arrays and ensure stats are properly copied
					state.primary.array = primaryResult;
					state.secondary.array = secondaryResult;

					console.log('Sort completed, checking timing information');
					console.log('Primary raw stats:', state.primary.stats);
					console.log('Secondary raw stats:', state.secondary.stats);

					// Ensure stats are properly set
					if (typeof state.primary.stats.startTime === 'number' && 
						typeof state.primary.stats.endTime === 'number' &&
						typeof state.secondary.stats.startTime === 'number' && 
						typeof state.secondary.stats.endTime === 'number') {
						
						console.log('Generating comparison results');
						state.comparisonResult = compareResults(
							{
								algorithm: state.primary.algorithm,
								stats: { ...state.primary.stats }  // Create a copy to ensure all properties are transferred
							},
							{
								algorithm: state.secondary.algorithm,
								stats: { ...state.secondary.stats }  // Create a copy to ensure all properties are transferred
							}
						);
						console.log('Comparison results:', state.comparisonResult);
						
						// Show results modal
						await sleep(100);
						state.showResults = true;
						console.log('Results modal should now be visible');
					} else {
						console.error('Invalid timing information:', {
							primary: {
								startTime: state.primary.stats.startTime,
								endTime: state.primary.stats.endTime
							},
							secondary: {
								startTime: state.secondary.stats.startTime,
								endTime: state.secondary.stats.endTime
							}
						});
					}
				} catch (error) {
					console.error('Error during compare sort:', error);
				}
			} else {
				console.log('Starting single view sort');
				try {
					// Generate new array and set it to both state.array and state.primary.array
					const newArray = generateArray(state.arraySize);
					state.array = newArray;
					state.primary.array = newArray;
					
					resetStats(state);
					resetStats(state.primary);

					// Ensure we're using the selected algorithm
					const selectedAlgorithm = state.primary.algorithm;
					console.log('Running single sort:', selectedAlgorithm);
					
					const sortedArray = await runSort({
						algorithm: selectedAlgorithm as SortingAlgorithm,
						array: state.primary.array,
						stats: state.primary.stats
					}, true);
					
					// Final update of the arrays
					updateArray(sortedArray, true);
				} catch (error) {
					console.error('Error during single sort:', error);
				}
			}
			
			state.isRunning = false;
			console.log('Sort process completed');
		}

		function shuffle() {
			const newArray = generateArray(state.arraySize);
			state.primary.array = [...newArray];
			if (state.viewMode === 'compare') {
				state.secondary.array = [...newArray];
			}
			state.isRunning = false;
		}

		function toggleCompareMode() {
			state.viewMode = state.viewMode === 'single' ? 'compare' : 'single';
			shuffle();
		}

		function updateArraySize(size: number) {
			state.arraySize = size;
			shuffle();
		}

		function stopSorting() {
			state.isRunning = false;
		}

		function toggleTheme() {
			state.theme = state.theme === 'dark' ? 'light' : 'dark';
			document.body.classList.toggle('light-theme');
		}

		function closeResults() {
			state.showResults = false;
		}

		function showInfo(algorithm: string) {
			alert(`${algorithm} Sort:\n${algorithmInfo[algorithm as SortingAlgorithm].description}\nTime Complexity: ${algorithmInfo[algorithm as SortingAlgorithm].timeComplexity}\nSpace Complexity: ${algorithmInfo[algorithm as SortingAlgorithm].spaceComplexity}`);
			// TODO: Replace with a proper modal or tooltip if desired
		}

		onMount(() => {
			shuffle();
			if (window.matchMedia('(prefers-color-scheme: light)').matches) {
				toggleTheme();
			}
		});

		// Helper function to update array state
		function updateArray(arr: ArrayBar[], isPrimary: boolean) {
			// Create a new array reference to ensure Svelte detects the change
			const updatedArray = arr.map(bar => ({ ...bar }));
			
			if (state.viewMode === 'compare') {
				if (isPrimary) {
					state.primary.array = updatedArray;
				} else {
					state.secondary.array = updatedArray;
				}
			} else {
				// In single view, update both arrays to ensure visualization
				state.array = updatedArray;
				state.primary.array = updatedArray;
			}
		}
</script>

<svelte:head>
	<title>Sorting Visualizer</title>
</svelte:head>

<div class="container" class:light-theme={state.theme === 'light'} class:showResults={state.showResults}>
	<nav>
		<div class="controls">
			<div class="algorithm-selectors">
				<div class="algorithm-select">
					<select bind:value={state.primary.algorithm}>
						{#each algorithms as algorithm}
							<option value={algorithm}>{algorithm.charAt(0).toUpperCase() + algorithm.slice(1)} Sort</option>
						{/each}
					</select>
					<div class="info-container">
						<button class="help-button" on:click={() => state.primary.showInfo = !state.primary.showInfo}>?</button>
						{#if state.primary.showInfo}
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div class="info-dropdown" on:mouseleave={() => state.primary.showInfo = false}>
								<h4>{state.primary.algorithm.charAt(0).toUpperCase() + state.primary.algorithm.slice(1)} Sort</h4>
								<p class="description">{algorithmInfo[state.primary.algorithm as SortingAlgorithm].description}</p>
								<div class="complexity-info">
									<div class="complexity-item">
										<span class="label">Time:</span>
										<span class="value">{algorithmInfo[state.primary.algorithm as SortingAlgorithm].timeComplexity}</span>
									</div>
									<div class="complexity-item">
										<span class="label">Space:</span>
										<span class="value">{algorithmInfo[state.primary.algorithm as SortingAlgorithm].spaceComplexity}</span>
									</div>
								</div>
							</div>
						{/if}
					</div>
				</div>

				{#if state.viewMode === 'compare'}
					<div class="algorithm-select">
						<select bind:value={state.secondary.algorithm}>
							{#each algorithms as algorithm}
								<option value={algorithm}>{algorithm.charAt(0).toUpperCase() + algorithm.slice(1)} Sort</option>
							{/each}
						</select>
						<div class="info-container">
							<button class="help-button" on:click={() => state.secondary.showInfo = !state.secondary.showInfo}>?</button>
							{#if state.secondary.showInfo}
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div class="info-dropdown" on:mouseleave={() => state.secondary.showInfo = false}>
									<h4>{state.secondary.algorithm.charAt(0).toUpperCase() + state.secondary.algorithm.slice(1)} Sort</h4>
									<p class="description">{algorithmInfo[state.secondary.algorithm as SortingAlgorithm].description}</p>
									<div class="complexity-info">
										<div class="complexity-item">
											<span class="label">Time:</span>
											<span class="value">{algorithmInfo[state.secondary.algorithm as SortingAlgorithm].timeComplexity}</span>
										</div>
										<div class="complexity-item">
											<span class="label">Space:</span>
											<span class="value">{algorithmInfo[state.secondary.algorithm as SortingAlgorithm].spaceComplexity}</span>
										</div>
									</div>
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</div>

			<div class="slider-group">
				<label>
					Array Size: {state.arraySize}
					<input 
						type="range" 
								min="5" 
								max="200" 
								bind:value={state.arraySize}
								on:change={() => updateArraySize(state.arraySize)}
								disabled={state.isRunning}
					/>
				</label>
			</div>
			
			<div class="slider-group">
				<label>
					Speed: {state.speed}ms
					<input 
						type="range" 
						min="1" 
						max="100" 
						bind:value={state.speed}
						disabled={state.isRunning}
					/>
				</label>
			</div>
			
			<div class="button-group">
				<button on:click={startSorting} disabled={state.isRunning}>
					Start
				</button>
				<button on:click={stopSorting} disabled={!state.isRunning} class="stop-button">
					Stop
				</button>
				<button on:click={shuffle} disabled={state.isRunning}>
					Shuffle
				</button>
				<button on:click={toggleCompareMode} disabled={state.isRunning} class="compare-button">
					{state.viewMode === 'single' ? 'Compare' : 'Single View'}
				</button>
				<button on:click={toggleTheme} class="theme-toggle">
					{state.theme === 'dark' ? '☀️' : '🌙'}
				</button>
			</div>
		</div>
	</nav>
	
	<div class="visualizer" class:compare-mode={state.viewMode === 'compare'}>
		<div class="sort-container primary" class:winner={state.primary.stats.isWinner}>
			{#if state.viewMode === 'compare'}
				<div class="sort-label">
					{state.primary.algorithm.charAt(0).toUpperCase() + state.primary.algorithm.slice(1)} Sort
					{#if state.primary.stats.isWinner}
						<span class="winner-badge">Winner! 🏆</span>
					{/if}
				</div>
			{/if}
			<div class="bars-container">
				{#each state.primary.array as bar}
					<div 
						class="bar"
						style="height: {bar.value}%; width: {100 / state.arraySize}%"
						class:comparing={bar.isComparing}
						class:swapping={bar.isSwapping}
						class:sorted={bar.isSorted}
						data-value={bar.value}
						data-padding={bar.isPadding || undefined}
					></div>
				{/each}
			</div>
		</div>

		{#if state.viewMode === 'compare'}
			<div class="sort-container secondary" class:winner={state.secondary.stats.isWinner}>
				<div class="sort-label">
					{state.secondary.algorithm.charAt(0).toUpperCase() + state.secondary.algorithm.slice(1)} Sort
					{#if state.secondary.stats.isWinner}
						<span class="winner-badge">Winner! 🏆</span>
					{/if}
				</div>
				<div class="bars-container">
					{#each state.secondary.array as bar}
						<div 
							class="bar"
							style="height: {bar.value}%; width: {100 / state.arraySize}%"
							class:comparing={bar.isComparing}
							class:swapping={bar.isSwapping}
							class:sorted={bar.isSorted}
							data-value={bar.value}
							data-padding={bar.isPadding || undefined}
						></div>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	{#if state.showResults && state.comparisonResult}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-backdrop" class:hidden={!state.showResults} on:click={closeResults} on:keydown={(e) => e.key === 'Escape' && closeResults()}>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div class="modal-content" on:click|stopPropagation>
				<div class="modal-header">
					<h2>Sorting Competition Results</h2>
					<button class="close-btn" on:click={closeResults}>&times;</button>
				</div>

				<div class="modal-body">
					<div class="winner-banner">
						🏆 Winner: {state.comparisonResult.winner} Sort
					</div>
					
					<div class="stats-grid">
						<div class="stat-column">
							<h3>{state.primary.algorithm} Sort</h3>
							<div class="metric">
								<span class="label">Time:</span>
								<span class="value">{(state.primary.stats.endTime! - state.primary.stats.startTime!).toFixed(2)}ms</span>
							</div>
							<div class="metric">
								<span class="label">Comparisons:</span>
								<span class="value">{state.primary.stats.comparisons}</span>
							</div>
							<div class="metric">
								<span class="label">Swaps:</span>
								<span class="value">{state.primary.stats.swaps}</span>
							</div>
							{#if state.primary.stats.isWinner}
								<span class="winner-badge">Winner! 🏆</span>
							{/if}
						</div>
						
						<div class="stat-column">
							<h3>{state.secondary.algorithm} Sort</h3>
							<div class="metric">
								<span class="label">Time:</span>
								<span class="value">{(state.secondary.stats.endTime! - state.secondary.stats.startTime!).toFixed(2)}ms</span>
							</div>
							<div class="metric">
								<span class="label">Comparisons:</span>
								<span class="value">{state.secondary.stats.comparisons}</span>
							</div>
							<div class="metric">
								<span class="label">Swaps:</span>
								<span class="value">{state.secondary.stats.swaps}</span>
							</div>
							{#if state.secondary.stats.isWinner}
								<span class="winner-badge">Winner! 🏆</span>
							{/if}
						</div>
					</div>

					<div class="analytics-grid">
						<div class="analytics-section">
							<h4>Performance Analysis</h4>
							<div class="metric">
								<span class="label">Speed Difference:</span>
								<span class="value">{state.comparisonResult.timeDifference.toFixed(2)}ms ({state.comparisonResult.percentageDifference.toFixed(1)}%)</span>
							</div>
							<div class="metric">
								<span class="label">Comparison Ratio:</span>
								<span class="value">{state.primary.stats.comparisons} vs {state.secondary.stats.comparisons}</span>
							</div>
							<div class="metric">
								<span class="label">Memory Operations:</span>
								<span class="value">{state.primary.stats.swaps} vs {state.secondary.stats.swaps} swaps</span>
							</div>
						</div>

						<div class="analytics-section">
							<h4>Complexity Analysis</h4>
							<div class="metric">
								<span class="label">{state.primary.algorithm}:</span>
								<span class="value">{algorithmInfo[state.primary.algorithm as SortingAlgorithm].timeComplexity}</span>
							</div>
							<div class="metric">
								<span class="label">{state.secondary.algorithm}:</span>
								<span class="value">{algorithmInfo[state.secondary.algorithm as SortingAlgorithm].timeComplexity}</span>
							</div>
						</div>

						<div class="analytics-section">
							<h4>Recommendations</h4>
							<div class="metric">
								{#if state.arraySize < 50}
									<span class="recommendation">Best for small arrays: Insertion Sort</span>
								{:else if state.arraySize < 100}
									<span class="recommendation">Best for medium arrays: Quick/Merge Sort</span>
								{:else}
									<span class="recommendation">Best for large arrays: Quick/Heap Sort</span>
								{/if}
							</div>
						</div>
					</div>
				</div>

				<div class="modal-footer">
					<button class="close-button" on:click={closeResults}>Close</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, sans-serif;
	}

	/* Hide padding elements */
	.bar[data-value="-1"] {
		opacity: 0;
		pointer-events: none;
	}

	.winner-badge {
		position: absolute;
		top: -10px;
		right: -10px;
		background-color: #ffd700;
		color: #1a1a1a;
		padding: 0.4rem 0.8rem;
		border-radius: 4px;
		font-weight: bold;
		font-size: 0.9rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		z-index: 1;
		display: none !important;
	}

	.showResults .winner-badge {
		display: inline-flex !important;
	}

	:global(body.light-theme) {
		background-color: #ffffff;
		color: #1a1a1a;
	}

	.container {
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #1a1a1a;
		color: #fff;
		transition: all 0.3s ease;
		overflow: hidden;
	}

	.light-theme {
		background-color: #ffffff;
		color: #1a1a1a;
	}

	nav {
		padding: 0.5rem 1rem;
		background-color: #2a2a2a;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.light-theme nav {
		background-color: #f0f0f0;
	}

	.controls {
		display: flex;
		gap: 1rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.algorithm-selector {
		position: relative;
		display: inline-block;
	}

	.info-bubble {
		position: relative;
		display: inline-block;
		margin-left: 0.5rem;
	}

	.info-icon {
		cursor: pointer;
		opacity: 0.7;
	}

	.info-content {
		display: none;
		position: absolute;
		top: 100%;
		left: 0;
		background-color: #3a3a3a;
		padding: 1rem;
		border-radius: 4px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		width: 300px;
		z-index: 1000;
	}

	.light-theme .info-content {
		background-color: #ffffff;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.info-bubble:hover .info-content {
		display: block;
	}

	.slider-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.button-group {
		display: flex;
		gap: 0.5rem;
	}

	select, button {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 4px;
		background-color: #3a3a3a;
		color: #fff;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.light-theme select,
	.light-theme button {
		background-color: #e0e0e0;
		color: #1a1a1a;
	}

	select:hover,
	button:hover {
		background-color: #4a4a4a;
	}

	.light-theme select:hover,
	.light-theme button:hover {
		background-color: #d0d0d0;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.theme-toggle {
		padding: 0.5rem;
		font-size: 1.2rem;
		line-height: 1;
	}

	.visualizer {
		flex: 1;
		display: flex;
		flex-direction: column !important;
		gap: 1rem;
		padding: 0.5rem;
		background-color: #1a1a1a;
		transition: all 0.3s ease;
		min-height: 0;
		overflow: hidden;
	}

	.visualizer.compare-mode {
		flex-direction: column !important;
	}

	.sort-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-height: 0;
	}

	.sort-container.primary {
		border-bottom: 2px solid #3a3a3a;
		padding-bottom: 1rem;
	}

	.light-theme .sort-container.primary {
		border-bottom: 2px solid #d0d0d0;
	}

	.bars-container {
		flex: 1;
		display: flex;
		align-items: flex-end;
		gap: 1px;
		position: relative;
		min-height: 0;
		padding: 0.5rem;
	}

	.bar {
		position: relative;
		background-color: #4a4a4a;
		transition: all 0.1s ease;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		padding-top: 2px;
	}

	.light-theme .bar {
		background-color: #d0d0d0;
	}

	.bar::after {
		content: attr(data-value);
		position: absolute;
		top: 2px;
		font-size: 0.6rem;
		color: rgba(255, 255, 255, 0.6);
		transform: rotate(-90deg);
		transform-origin: center;
		white-space: nowrap;
	}

	.light-theme .bar::after {
		color: rgba(0, 0, 0, 0.6);
	}

	.comparing {
		background-color: #ffd700;
	}

	.swapping {
		background-color: #ff4444;
	}

	.sorted {
		background-color: #44ff44;
	}

	.sort-label {
		text-align: center;
		font-size: 1rem;
		font-weight: bold;
		padding: 0.25rem;
		background-color: #2a2a2a;
		border-radius: 4px;
		margin: 0 0.5rem;
	}

	.light-theme .sort-label {
		background-color: #e0e0e0;
	}

	@media (max-width: 768px) {
		.controls {
			flex-direction: column;
			align-items: stretch;
			gap: 0.5rem;
		}

		.algorithm-selectors {
			flex-direction: column;
			gap: 0.5rem;
		}

		.bar::after {
			font-size: 0.5rem;
		}
	}

	.algorithm-selectors {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.compare-button {
		background-color: #4075a6;
		color: white;
	}

	.light-theme .compare-button {
		background-color: #4075a6;
		color: white;
	}

	.compare-button:hover {
		background-color: #5085b6;
	}

	.visualizer {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.visualizer.compare-mode {
		flex-direction: row;
	}

	.sort-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.sort-label {
		text-align: center;
		font-size: 1.2rem;
		font-weight: bold;
		padding: 0.5rem;
	}

	.bars-container {
		flex: 1;
		display: flex;
		align-items: flex-end;
		gap: 1px;
	}

	@media (max-width: 768px) {
		.visualizer.compare-mode {
			flex-direction: column;
		}

		.algorithm-selectors {
			flex-direction: column;
			gap: 0.5rem;
		}
	}

	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.85);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 10000;
	}

	.modal-backdrop.hidden {
		display: none;
	}

	.modal-content {
		background-color: #2a2a2a;
		border-radius: 8px;
		width: 90%;
		max-width: 800px;
		max-height: 90vh;
		overflow-y: auto;
		padding: 20px;
		position: relative;
		color: #fff;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.winner-banner {
		background-color: #44ff44;
		color: #1a1a1a;
		padding: 1rem;
		text-align: center;
		font-size: 1.5rem;
		font-weight: bold;
		border-radius: 4px;
		margin-bottom: 1.5rem;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0% { transform: scale(1); }
		50% { transform: scale(1.05); }
		100% { transform: scale(1); }
	}

	.stats-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.stat-column {
		background-color: #333;
		padding: 1.5rem;
		border-radius: 8px;
		position: relative;
	}

	.winner-badge {
		position: absolute;
		top: -10px;
		right: -10px;
		background-color: #ffd700;
		color: #1a1a1a;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		font-weight: bold;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		z-index: 1;
	}

	.close-btn {
		position: absolute;
		top: 10px;
		right: 10px;
		background: none;
		border: none;
		color: #fff;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.5rem;
		z-index: 2;
	}

	.light-theme .modal-content {
		background-color: #fff;
		color: #1a1a1a;
	}

	.modal-header {
		padding: 1rem;
		border-bottom: 1px solid #3a3a3a;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.modal-body {
		padding: 1rem;
	}

	.modal-footer {
		padding: 1rem;
		border-top: 1px solid #3a3a3a;
		text-align: right;
	}

	.close-button {
		background-color: #4075a6;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		transition: background-color 0.3s ease;
	}

	.close-button:hover {
		background-color: #5085b6;
	}

	.insights {
		background-color: #3a3a3a;
		padding: 1.5rem;
		border-radius: 4px;
		margin-top: 1rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.light-theme .insights {
		background-color: #f0f0f0;
	}

	.insights ul {
		list-style-type: none;
		padding: 0;
		margin: 0.5rem 0;
	}

	.insights li {
		margin-bottom: 0.75rem;
		padding-left: 1.5rem;
		position: relative;
		line-height: 1.4;
	}

	.insights li::before {
		content: "•";
		position: absolute;
		left: 0;
		color: #44ff44;
		font-weight: bold;
	}

	@media (max-width: 768px) {
		.stats-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.modal-content {
			width: 95%;
			margin: 1rem;
		}

		.stat-column,
		.insights {
			padding: 1rem;
		}
	}

	.analytics-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		background-color: #222;
		padding: 1rem;
		border-radius: 4px;
	}

	.analytics-section {
		background-color: #333;
		padding: 0.75rem;
		border-radius: 4px;
	}

	.analytics-section h4 {
		margin: 0 0 0.5rem 0;
		font-size: 0.9rem;
		color: #aaa;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.metric {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
		line-height: 1.4;
	}

	.label {
		color: #aaa;
		margin-right: 0.5rem;
	}

	.value {
		font-weight: 500;
		color: #fff;
		text-align: right;
	}

	.recommendation {
		color: #44ff44;
		font-weight: 500;
		font-size: 0.9rem;
	}

	.light-theme .modal-content {
		background-color: #fff;
		color: #1a1a1a;
	}

	.light-theme .stat-column,
	.light-theme .analytics-section {
		background-color: #f5f5f5;
	}

	.light-theme .analytics-grid {
		background-color: #eee;
	}

	.light-theme .label {
		color: #666;
	}

	.light-theme .value {
		color: #1a1a1a;
	}

	.light-theme .analytics-section h4 {
		color: #444;
	}

	@media (max-width: 768px) {
		.modal-content {
			width: 95%;
			margin: 1rem;
		}

		.analytics-grid {
			grid-template-columns: 1fr;
		}

		.metric {
			font-size: 0.85rem;
		}

		.winner-badge {
			font-size: 0.8rem;
			padding: 0.3rem 0.6rem;
		}
	}

	.algorithm-selectors {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.algorithm-select {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.algorithm-select select {
		padding: 0.5rem;
		border-radius: 4px;
		background-color: #333;
		color: #fff;
		border: 1px solid #444;
		cursor: pointer;
		font-size: 0.9rem;
	}

	.help-button {
		background: none;
		border: none;
		color: #666;
		font-size: 0.9rem;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		transition: color 0.2s;
		font-weight: normal;
	}

	.help-button:hover {
		color: #fff;
	}

	.light-theme .algorithm-select select {
		background-color: #fff;
		color: #1a1a1a;
		border-color: #ddd;
	}

	.light-theme .help-button {
		color: #999;
	}

	.light-theme .help-button:hover {
		color: #333;
	}

	.info-container {
		position: relative;
		display: inline-block;
	}

	.info-dropdown {
		position: absolute;
		top: calc(100% + 5px);
		right: -280px;
		width: 280px;
		background: #2a2a2a;
		border-radius: 6px;
		padding: 1rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		z-index: 1000;
		animation: fadeIn 0.2s ease-out;
	}

	.light-theme .info-dropdown {
		background: #fff;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.info-dropdown h4 {
		margin: 0 0 0.5rem 0;
		color: #fff;
		font-size: 1rem;
	}

	.description {
		color: #aaa;
		font-size: 0.9rem;
		line-height: 1.4;
		margin-bottom: 0.75rem;
	}

	.complexity-info {
		background: #333;
		border-radius: 4px;
		padding: 0.75rem;
	}

	.complexity-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.complexity-item:last-child {
		margin-bottom: 0;
	}

	.complexity-item .label {
		color: #888;
		font-size: 0.85rem;
	}

	.complexity-item .value {
		color: #4CAF50;
		font-family: monospace;
		font-size: 0.9rem;
	}

	.light-theme .info-dropdown h4 {
		color: #333;
	}

	.light-theme .description {
		color: #666;
	}

	.light-theme .complexity-info {
		background: #f5f5f5;
	}

	.light-theme .complexity-item .label {
		color: #666;
	}

	.light-theme .complexity-item .value {
		color: #2E7D32;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		.info-dropdown {
			right: 0;
			transform: translateX(50%);
		}
	}

	/* Hide padding elements completely */
	.bar[data-value][data-padding="true"] {
		display: none;
	}
</style>
