export interface SortStats {
    startTime: number | null;
    endTime: number | null;
    comparisons: number;
    swaps: number;
    isWinner?: boolean;
}

export interface ComparisonResult {
    winner: string;
    timeDifference: number;
    percentageDifference: number;
    insights: string[];
    primary: SortStats;
    secondary: SortStats;
}

export interface ArrayBar {
    value: number;
    isComparing: boolean;
    isSwapping: boolean;
    isSorted: boolean;
    isPadding?: boolean;
}

export type SortingAlgorithm = 
    | 'bubble' 
    | 'quick' 
    | 'merge' 
    | 'insertion' 
    | 'selection' 
    | 'heap' 
    | 'shell' 
    | 'cocktail' 
    | 'gnome' 
    | 'comb' 
    | 'cycle' 
    | 'pancake' 
    | 'counting' 
    | 'radix';

export interface SortingState {
    algorithm: string;
    array: ArrayBar[];
    stats: SortStats;
    currentIndices: number[];
    isSorted: boolean;
    primary: {
        algorithm: string;
        array: ArrayBar[];
        stats: SortStats;
        currentIndices: number[];
        isSorted: boolean;
        showInfo?: boolean;
    };
    secondary: {
        algorithm: string;
        array: ArrayBar[];
        stats: SortStats;
        currentIndices: number[];
        isSorted: boolean;
        showInfo?: boolean;
    };
    viewMode: 'single' | 'compare';
    isRunning: boolean;
    showResults: boolean;
    speed: number;
    arraySize: number;
    theme: 'dark' | 'light';
    comparisonResult?: ComparisonResult;
}

export interface AlgorithmInfo {
    description: string;
    timeComplexity: string;
    spaceComplexity: string;
}

export const algorithmInfo: Record<SortingAlgorithm, AlgorithmInfo> = {
    bubble: {
        description: "A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)"
    },
    quick: {
        description: "A divide-and-conquer algorithm that works by selecting a 'pivot' element and partitioning the array around it.",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(log n)"
    },
    merge: {
        description: "A divide-and-conquer algorithm that divides the array into smaller subarrays, sorts them, and then merges them.",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)"
    },
    insertion: {
        description: "Builds the final sorted array one item at a time by repeatedly inserting a new element into the sorted portion of the array.",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)"
    },
    selection: {
        description: "Divides the input list into a sorted and an unsorted region, and repeatedly selects the smallest element from the unsorted region.",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)"
    },
    heap: {
        description: "Uses a binary heap data structure to sort elements by repeatedly extracting the maximum element.",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(1)"
    },
    shell: {
        description: "An optimization of insertion sort that allows the exchange of items that are far apart, progressively reducing the gap between elements to be compared.",
        timeComplexity: "O(n log n) ~ O(n²)",
        spaceComplexity: "O(1)"
    },
    counting: {
        description: "An integer sorting algorithm that works by counting the number of objects having distinct key values, then calculating their positions.",
        timeComplexity: "O(n + k)",
        spaceComplexity: "O(k)"
    },
    radix: {
        description: "Sorts integers by processing each digit position, starting from the least significant digit to the most significant digit.",
        timeComplexity: "O(d * (n + k))",
        spaceComplexity: "O(n + k)"
    },
    cocktail: {
        description: "A variation of bubble sort that sorts bidirectionally, bubbling both the largest and smallest values in each pass.",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)"
    },
    gnome: {
        description: "A simple sorting algorithm similar to insertion sort, but moving elements to their proper position by a series of swaps.",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)"
    },
    comb: {
        description: "An improvement over bubble sort that eliminates turtles (small values near the end) effectively.",
        timeComplexity: "O(n² / 2^p)",
        spaceComplexity: "O(1)"
    },
    cycle: {
        description: "An in-place sorting algorithm that minimizes memory writes by cycling through arrays to make the minimum number of moves.",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)"
    },
    pancake: {
        description: "Sorts by repeatedly flipping the prefix of the array (like flipping pancakes) until the array is sorted.",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)"
    }
}; 