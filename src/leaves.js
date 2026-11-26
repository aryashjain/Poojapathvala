// Leaf pages: each one has its own text and, for the moon pages, dates computed from the moon calculation.
export const MOON_LEAVES = [
  { slug: 'new-moon', name: 'New Moon', text: 'The moon sits between the earth and the sun, so its lit side faces away from us. Many people use this quiet, dark sky to set an intention and write down what they want to begin.' },
  { slug: 'waxing-crescent', name: 'Waxing Crescent', text: 'A thin sliver of light appears on the right side of the moon in the evenings. It is a time for small beginnings, first steps and a little hope about what is growing.' },
  { slug: 'first-quarter', name: 'First Quarter', text: 'Half of the moon is lit, and the light keeps growing. The phase is often linked with decisions, effort and moving obstacles out of the way.' },
  { slug: 'waxing-gibbous', name: 'Waxing Gibbous', text: 'More than half of the moon is lit and the brightness keeps rising. It is a time to refine plans, check details and prepare for what is coming.' },
  { slug: 'full-moon', name: 'Full Moon', text: 'The whole face of the moon is lit as it sits opposite the sun. Many people mark this night with gratitude, reflection and a look at what has come to completion.' },
  { slug: 'waning-gibbous', name: 'Waning Gibbous', text: 'The moon is still bright but its light is shrinking. This is a time to share what you have learned, give thanks and pass on what helped you.' },
  { slug: 'last-quarter', name: 'Last Quarter', text: 'Half of the moon is lit again, now on the left side. It is often a time to release what no longer serves you and to clear space.' },
  { slug: 'waning-crescent', name: 'Waning Crescent', text: 'Only a thin sliver is left before the dark moon returns. It suits rest, quiet and reflection before the next cycle begins.' },
];

export const ANGEL_NUMBERS = [
  { n: '000', text: 'Zero is often read as a blank page: a moment of possibility with no fixed shape yet. Many people see it as a sign to trust a new direction and let the details unfold.' },
  { n: '111', text: 'Repeated ones are often read as a call to notice your thoughts. Many take it as a reminder to look at what you are focusing on and to begin with a clear intention.' },
  { n: '123', text: 'A simple sequence that people often read as steps moving forward. It can be a reminder to take the next small action and build from there.' },
  { n: '222', text: 'Repeated twos are often linked with balance, patience and cooperation. Many read it as a sign to trust the timing of things and to work with others.' },
  { n: '321', text: 'The count running down is often read as letting go of the old before the new arrives. It can invite you to release a habit or a worry and make room.' },
  { n: '333', text: 'Threes are often connected with growth, creativity and expression. Many take this as an encouragement to share your ideas and to keep creating.' },
  { n: '432', text: 'Often read as a reminder that steady, practical effort builds a solid foundation. It can encourage you to keep going with the work you have started.' },
  { n: '444', text: 'Repeated fours are commonly linked with stability and support. Many read this as a sign that you are held, and that structure and order are forming.' },
  { n: '555', text: 'Fives are often associated with change and freedom. Many read this as a sign that a shift is coming, and as an invitation to adapt with an open mind.' },
  { n: '707', text: 'Seven is often linked with reflection and inner knowing. Many read this number as a reminder to slow down, listen inward and trust what you already sense.' },
  { n: '777', text: 'Sevens are widely read as a sign of luck and encouragement. Many take it as a reminder to notice the good that is already present.' },
  { n: '888', text: 'Eights are often connected with abundance and balance in material and inner life. Many read this as a reminder to give and receive with fairness.' },
  { n: '999', text: 'Nines are often read as completion. Many take this as a sign that a chapter is closing, and as an invitation to finish what you started with care.' },
  { n: '1010', text: 'A pattern of ones and zeros is often read as a combination of a new beginning and a fresh focus. Many see it as a reminder to stay positive as you move forward.' },
  { n: '1111', text: 'Four ones are often read as a moment to align your thoughts with your goals. Many take it as a signal to pay close attention to what you are thinking about right now.' },
  { n: '1212', text: 'This sequence is often read as a sign of a meaningful turn and of trusting the path you are on. Many see it as a reminder that you are moving in the right direction.' },
  { n: '1234', text: 'A count from one to four is often read as a step-by-step progression. It can encourage you to take the next step in order, without rushing ahead.' },
  { n: '2222', text: 'Four twos are often read as a deeper call to harmony and partnership. Many take it as a reminder to listen to others and to bring calm into your relationships.' },
];

export function angelBySlug(slug) {
  return ANGEL_NUMBERS.find((a) => a.n === slug) || null;
}
export function moonLeafBySlug(slug) {
  return MOON_LEAVES.find((m) => m.slug === slug) || null;
}
