import type { NoticeEvent, ChecklistItem } from '../types';

export function generateAiPrepPlan(event: NoticeEvent): ChecklistItem[] {
  const company = event.company || 'the target company';
  const category = event.type;
  const lowerTitle = event.title.toLowerCase();

  const plan: ChecklistItem[] = [];

  if (category === 'Placement' || category === 'Internship' || lowerTitle.includes('interview')) {
    plan.push(
      { id: `prep_${Date.now()}_1`, text: `Day 1: Research ${company} product suite, tech stack, and recent business news.`, done: false },
      { id: `prep_${Date.now()}_2`, text: `Day 1: Revise Data Structures, System Design, Operating Systems & DBMS core concepts.`, done: false },
      { id: `prep_${Date.now()}_3`, text: `Day 2: Solve 10 standard LeetCode Medium algorithms (Graphs, Dynamic Programming, Trees).`, done: false },
      { id: `prep_${Date.now()}_4`, text: `Day 2: Prepare STAR method answers for past internship and academic project experiences.`, done: false },
      { id: `prep_${Date.now()}_5`, text: `Day 3: Conduct a 45-minute mock technical interview & polish resume points.`, done: false },
      { id: `prep_${Date.now()}_6`, text: `Day 3: Test webcam, microphone, stable internet connection & background setup.`, done: false }
    );
  } else if (category === 'Exam' || lowerTitle.includes('test') || lowerTitle.includes('assessment')) {
    plan.push(
      { id: `prep_${Date.now()}_1`, text: `Day 1: Review all primary lecture slides, official syllabus notes & textbook chapters.`, done: false },
      { id: `prep_${Date.now()}_2`, text: `Day 1: Solve previous 3 years exam papers & sample questions under timed conditions.`, done: false },
      { id: `prep_${Date.now()}_3`, text: `Day 2: Create a 1-page summary formula cheat sheet & review weak topic areas.`, done: false },
      { id: `prep_${Date.now()}_4`, text: `Day 3: Final quick review & verify allowed materials (student ID card, calculator).`, done: false }
    );
  } else if (category === 'Assignment') {
    plan.push(
      { id: `prep_${Date.now()}_1`, text: `Step 1: Read rubric requirements and set up project repository / notebook environment.`, done: false },
      { id: `prep_${Date.now()}_2`, text: `Step 2: Implement core logic, algorithms, data pipelines and run initial test cases.`, done: false },
      { id: `prep_${Date.now()}_3`, text: `Step 3: Document code comments, format final PDF report, and submit before deadline.`, done: false }
    );
  } else {
    plan.push(
      { id: `prep_${Date.now()}_1`, text: `Phase 1: Read all circular guidelines and eligibility requirements.`, done: false },
      { id: `prep_${Date.now()}_2`, text: `Phase 2: Complete registration/submission fields & double-check information.`, done: false },
      { id: `prep_${Date.now()}_3`, text: `Phase 3: Verify confirmation receipt and add event reminder to calendar.`, done: false }
    );
  }

  return plan;
}
