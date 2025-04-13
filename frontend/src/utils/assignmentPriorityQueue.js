// utils/assignmentPriorityQueue.js
class PriorityQueue {
    constructor(comparator = (a, b) => a.priority - b.priority) {
      this._heap = [];
      this._comparator = comparator;
    }
  
    size() {
      return this._heap.length;
    }
  
    isEmpty() {
      return this.size() === 0;
    }
  
    peek() {
      return this._heap[0];
    }
  
    push(value) {
      this._heap.push(value);
      this._siftUp();
    }
  
    pop() {
      const poppedValue = this.peek();
      const bottom = this._heap.pop();
      if (!this.isEmpty()) {
        this._heap[0] = bottom;
        this._siftDown();
      }
      return poppedValue;
    }
  
    _parent(index) {
      return Math.floor((index - 1) / 2);
    }
  
    _leftChild(index) {
      return index * 2 + 1;
    }
  
    _rightChild(index) {
      return index * 2 + 2;
    }
  
    _siftUp() {
      let nodeIndex = this.size() - 1;
      while (nodeIndex > 0 && this._comparator(this._heap[nodeIndex], this._heap[this._parent(nodeIndex)]) < 0) {
        [this._heap[nodeIndex], this._heap[this._parent(nodeIndex)]] = [
          this._heap[this._parent(nodeIndex)],
          this._heap[nodeIndex],
        ];
        nodeIndex = this._parent(nodeIndex);
      }
    }
  
    _siftDown() {
      let nodeIndex = 0;
      while (
        (this._leftChild(nodeIndex) < this.size() &&
          this._comparator(this._heap[this._leftChild(nodeIndex)], this._heap[nodeIndex]) < 0) ||
        (this._rightChild(nodeIndex) < this.size() &&
          this._comparator(this._heap[this._rightChild(nodeIndex)], this._heap[nodeIndex]) < 0)
      ) {
        let smallerChildIndex =
          this._rightChild(nodeIndex) < this.size() &&
          this._comparator(this._heap[this._rightChild(nodeIndex)], this._heap[this._leftChild(nodeIndex)]) < 0
            ? this._rightChild(nodeIndex)
            : this._leftChild(nodeIndex);
  
        [this._heap[nodeIndex], this._heap[smallerChildIndex]] = [
          this._heap[smallerChildIndex],
          this._heap[nodeIndex],
        ];
        nodeIndex = smallerChildIndex;
      }
    }
  }
  
  export const sortAssignmentsWithPriorityQueue = (assignments) => {
    const pq = new PriorityQueue((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    assignments.forEach(a => pq.push(a));
  
    const sorted = [];
    while (!pq.isEmpty()) {
      sorted.push(pq.pop());
    }
  
    return sorted;
  };
  