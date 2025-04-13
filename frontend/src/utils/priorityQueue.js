// priorityQueue.js

export function selectQuestionsWithPriority(courseId, questions, count) {
    const unassigned = questions.filter(q => !q.assignedTo?.includes(courseId));
    const assigned = questions.filter(q => q.assignedTo?.includes(courseId));
  
    const selected = [];
  
    // Prefer unassigned first
    while (selected.length < count && unassigned.length > 0) {
      const index = Math.floor(Math.random() * unassigned.length);
      selected.push(unassigned.splice(index, 1)[0]);
    }
  
    // If needed, fallback to assigned
    while (selected.length < count && assigned.length > 0) {
      const index = Math.floor(Math.random() * assigned.length);
      selected.push(assigned.splice(index, 1)[0]);
    }
  
    return selected;
  }
  