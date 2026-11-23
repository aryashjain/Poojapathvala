// The 78 cards of the Tarot, with original meanings written for this site.
// tone: 'p' positive, 'n' negative or challenging, 'x' neutral or mixed.
// Used by the reader (yes/no spreads) and the card pages. For entertainment purposes only.
const MAJOR = [
  ['the-fool', 'The Fool', 0, 'p', 'New beginnings, spontaneity and trust in the journey. Take the leap, but keep an eye on the edge.', 'Recklessness or hesitation. Think before you jump.'],
  ['the-magician', 'The Magician', 1, 'p', 'Skill, willpower and turning ideas into action. You have what you need to begin.', 'Manipulation, scattered energy or talent left unused.'],
  ['the-high-priestess', 'The High Priestess', 2, 'x', 'Intuition, quiet knowledge and the answer not yet spoken. Listen inward.', 'Ignoring your inner voice, or secrets that want to surface.'],
  ['the-empress', 'The Empress', 3, 'p', 'Abundance, nurturing and creativity. Growth through care for yourself and others.', 'Dependence, neglect of self or a creative block.'],
  ['the-emperor', 'The Emperor', 4, 'p', 'Structure, authority and stability. Build firm foundations and lead with clarity.', 'Rigidity, control issues or misuse of power.'],
  ['the-hierophant', 'The Hierophant', 5, 'x', 'Tradition, guidance and shared values. Learning from a teacher or an established path.', 'Breaking with convention, or questioning rules that no longer serve you.'],
  ['the-lovers', 'The Lovers', 6, 'p', 'Love, union and choices aligned with your values. A relationship or a meaningful decision.', 'Disharmony, misaligned values or indecision.'],
  ['the-chariot', 'The Chariot', 7, 'p', 'Determination and victory through discipline. Move forward with control.', 'Lack of direction, obstacles or forcing things.'],
  ['strength', 'Strength', 8, 'p', 'Courage, patience and gentle inner strength. Calm power wins over force.', 'Self-doubt, impatience or raw emotion running ahead.'],
  ['the-hermit', 'The Hermit', 9, 'x', 'Reflection, solitude and inner guidance. Time to step back and seek wisdom.', 'Isolation, withdrawal or refusing counsel.'],
  ['wheel-of-fortune', 'Wheel of Fortune', 10, 'p', 'Change, cycles and turning points. Fate is moving; ride the wheel.', 'Resistance to change, bad timing or a temporary setback.'],
  ['justice', 'Justice', 11, 'x', 'Fairness, truth and balanced decisions. Consequences follow actions.', 'Unfairness, dishonesty or avoiding responsibility.'],
  ['the-hanged-man', 'The Hanged Man', 12, 'n', 'A pause, surrender and seeing things from a new angle. Patience brings insight.', 'Stalling, needless sacrifice or resisting letting go.'],
  ['death', 'Death', 13, 'n', 'Endings, transformation and letting go. Something must end so something new can begin.', 'Holding on to the past or fear of change.'],
  ['temperance', 'Temperance', 14, 'p', 'Balance, moderation and healing. Blend opposites with patience.', 'Excess, imbalance or impatience.'],
  ['the-devil', 'The Devil', 15, 'n', 'Attachment, temptation and feeling trapped. Notice what binds you.', 'Breaking free and awareness of limiting habits.'],
  ['the-tower', 'The Tower', 16, 'n', 'Sudden upheaval and the collapse of false structures. Painful, but clearing.', 'Avoiding disaster, or a slow unravelling of the same issues.'],
  ['the-star', 'The Star', 17, 'p', 'Hope, renewal and healing after hardship. Trust that the light is returning.', 'Discouragement, lost faith or feeling disconnected.'],
  ['the-moon', 'The Moon', 18, 'n', 'Illusion, fear and the unknown. Things are not as they seem; trust your intuition carefully.', 'Fear and confusion beginning to clear.'],
  ['the-sun', 'The Sun', 19, 'p', 'Joy, success and vitality. A clear, warm period of happiness.', 'Temporary dimming, overconfidence or delayed joy.'],
  ['judgement', 'Judgement', 20, 'p', 'Awakening, reckoning and a call to a higher purpose.', 'Self-doubt, ignoring the call or harsh self-judgement.'],
  ['the-world', 'The World', 21, 'p', 'Completion, fulfilment and wholeness. A cycle is complete.', 'Unfinished business or lack of closure.'],
];

// [id, name, suit, rank number 1-14, tone, upright, reversed]
const SUIT_NAMES = { wands: 'Wands', cups: 'Cups', swords: 'Swords', pentacles: 'Pentacles' };
const RANK_NAMES = { 1: 'Ace', 11: 'Page', 12: 'Knight', 13: 'Queen', 14: 'King' };
const MINOR = {
  wands: [
    ['p', 'A spark of inspiration, a new project or creative energy. Begin with enthusiasm.', 'Delays, lack of motivation or a stalled idea.'],
    ['x', 'Planning a bigger future and weighing your options. You can see the wider world.', 'Fear of the unknown, or plans that stay on paper.'],
    ['p', 'Progress, expansion and ventures paying off. Look ahead with confidence.', 'Setbacks in plans, or waiting on others.'],
    ['p', 'Celebration, home and a stable milestone. A joyful gathering.', 'An unsettled home or conflict about commitments.'],
    ['n', 'Competition, friction and clashing ideas. Healthy debate or a scramble for position.', 'Avoiding conflict, or conflicts finally ending.'],
    ['p', 'Victory, recognition and public success. Confidence is rewarded.', 'Pride before a fall, or delayed recognition.'],
    ['n', 'Standing your ground against challenges. Defending your position.', 'Feeling overwhelmed or giving up the fight.'],
    ['p', 'Speed, swift news and things moving quickly. Momentum is with you.', 'Delays, frustration or scattered energy.'],
    ['n', 'Resilience and a final effort before victory. You are close; stay guarded.', 'Exhaustion, suspicion or refusing help.'],
    ['n', 'Burden, overcommitment and carrying too much. Delegate where you can.', 'Release of burdens, or collapsing under pressure.'],
    ['x', 'A curious messenger, a new idea or a learning phase. Enthusiasm for discovery.', 'Immaturity, impatience or unwelcome news.'],
    ['p', 'Energy, adventure and pursuing goals with passion. Action now.', 'Recklessness, burnout or restlessness.'],
    ['p', 'Confidence, warmth and an independent spirit. Lead with charisma.', 'Jealousy, insecurity or domineering behaviour.'],
    ['p', 'Visionary leadership, bold decisions and natural authority.', 'Impulsiveness, arrogance or ruthlessness.'],
  ],
  cups: [
    ['p', 'A new emotional beginning, love or creative fulfilment. An open heart.', 'Emotional blockage or feelings left unspoken.'],
    ['p', 'Partnership, mutual attraction and understanding. A balanced connection.', 'Imbalance, misunderstanding or a break in trust.'],
    ['p', 'Friendship, celebration and community. Joy shared with others.', 'Overindulgence, gossip or isolation from friends.'],
    ['n', 'Apathy, contemplation and missed opportunities. Look again at what you have.', 'Re-engagement and new motivation after a slump.'],
    ['n', 'Grief, loss and focus on what went wrong. Some hope remains.', 'Acceptance and moving on from loss.'],
    ['p', 'Nostalgia, childhood memories and innocent joy. Reconnect with the past.', 'Stuck in the past, or unrealistic expectations of others.'],
    ['n', 'Many choices and daydreams. Separate illusion from real options.', 'Clarity, a decision made, or confusion lifting.'],
    ['n', 'Walking away from what no longer fulfils you. Seeking deeper meaning.', 'Fear of leaving, or drifting without purpose.'],
    ['p', 'Wishes granted, satisfaction and emotional contentment.', 'Overindulgence or wishes that stay unfulfilled.'],
    ['p', 'Harmony, family happiness and emotional fulfilment.', 'Family disharmony or emotional distance.'],
    ['p', 'A sensitive message, creative curiosity or a tender new feeling.', 'Emotional immaturity or unrealistic dreams.'],
    ['p', 'Romance, an invitation and following the heart. Charm and gentle pursuit.', 'Jealousy, moodiness or unrealistic expectations.'],
    ['p', 'Compassion, intuition and emotional maturity. A nurturing presence.', 'Over-sensitivity, insecurity or emotional manipulation.'],
    ['p', 'Emotional balance, wisdom and calm leadership with compassion.', 'Emotional volatility or coldness.'],
  ],
  swords: [
    ['x', 'Clarity, a breakthrough in truth and a new idea. Cut through confusion.', 'Confusion, harsh words or a clouded mind.'],
    ['n', 'A difficult choice, a stalemate or avoiding a decision.', 'Information overload, indecision ending, or a lie revealed.'],
    ['n', 'Heartbreak, sorrow and a painful truth. Grief is part of healing.', 'Recovery from hurt, and forgiveness.'],
    ['n', 'Rest, recovery and retreat to restore the mind.', 'Restlessness, burnout or returning too soon.'],
    ['n', 'Conflict, winning at all costs, a hollow victory.', 'Reconciliation, regret or ending a conflict.'],
    ['p', 'Moving on, transition and leaving difficulty behind.', 'Stuck in the past, or a difficult journey delayed.'],
    ['n', 'Deception, strategy and acting alone. Be careful what is hidden.', 'Confession, conscience or being found out.'],
    ['n', 'Feeling trapped by thoughts or circumstances. The cage may be open.', 'Freedom found and self-acceptance.'],
    ['n', 'Anxiety, worry and sleepless nights. Fear is louder than the facts.', 'Hope returning and facing fears.'],
    ['n', 'A painful ending or rock bottom. Endings bring a fresh start.', 'Recovery after a hard ending.'],
    ['x', 'Curiosity, a sharp mind and vigilance. Learn and speak carefully.', 'Gossip, unfocused energy or hasty speech.'],
    ['n', 'Action, ambition and rushing into things. Speed with clarity.', 'Recklessness, aggression or scattered focus.'],
    ['x', 'Independence, clear thinking and honest communication.', 'Coldness, bitterness or harsh judgement.'],
    ['x', 'Intellectual authority, truth and fair judgement.', 'Manipulation, tyranny or cold decisions.'],
  ],
  pentacles: [
    ['p', 'A new financial or career opportunity. Plant a seed for growth.', 'A missed opportunity or a scarcity mindset.'],
    ['n', 'Balancing priorities and juggling demands. Flexibility is the key.', 'Overwhelm or poor money management.'],
    ['p', 'Teamwork, skill and recognition at work. Build something lasting.', 'Lack of teamwork or mediocre results.'],
    ['n', 'Security, saving and holding on tightly. Caution about control.', 'Greed, financial insecurity or letting go too fast.'],
    ['n', 'Hardship, isolation and financial worry. Help is nearby.', 'Recovery from hardship and new support.'],
    ['p', 'Generosity, fair exchange and sharing resources.', 'Debt, unequal giving or help with conditions.'],
    ['n', 'Patience, assessing progress and waiting for the harvest.', 'Impatience or work that goes unrewarded.'],
    ['p', 'Diligence, mastery and steady skill-building.', 'Perfectionism, lack of focus or low standards.'],
    ['p', 'Independence, comfort and self-reliance. Enjoy the fruits of your effort.', 'Dependence or overspending.'],
    ['p', 'Wealth, family legacy and long-term security.', 'Family disputes or financial loss.'],
    ['p', 'Study, new skills and a practical opportunity. Stay curious.', 'Procrastination or a lack of progress.'],
    ['p', 'Reliability, hard work and steady progress. Slow and sure.', 'Stagnation, perfectionism or boredom.'],
    ['p', 'Nurturing, practical care and abundance. Grounded and warm.', 'Self-neglect or a work-life imbalance.'],
    ['p', 'Financial success, stability and generous leadership.', 'Greed, stubbornness or overindulgence.'],
  ],
};

const minorCards = Object.entries(MINOR).flatMap(([suit, rows]) =>
  rows.map(([tone, upright, reversed], index) => {
    const rank = index + 1;
    const rankName = RANK_NAMES[rank] || String(rank);
    const name = (RANK_NAMES[rank] ? rankName : rankName) + ' of ' + SUIT_NAMES[suit];
    return {
      id: name.toLowerCase().replace(/ of /g, '-of-').replace(/\s+/g, '-'),
      name,
      suit,
      number: rank,
      arcana: 'minor',
      tone,
      upright,
      reversed,
    };
  })
);

export const CARDS = [
  ...MAJOR.map(([id, name, number, tone, upright, reversed]) => ({ id, name, suit: 'major', number, arcana: 'major', tone, upright, reversed })),
  ...minorCards,
];

export const SPREADS = {
  daily: { label: 'Daily card', positions: ['Today'] },
  three: { label: 'Past, Present, Future', positions: ['Past', 'Present', 'Future'] },
  yesno: { label: 'Yes or No', positions: ['Answer'] },
  love: { label: 'Love spread', positions: ['You', 'Them', 'Outcome'] },
  career: { label: 'Career spread', positions: ['Current', 'Obstacle', 'Advice'] },
};

export const SUIT_LABELS = { major: 'Major Arcana', wands: 'Wands', cups: 'Cups', swords: 'Swords', pentacles: 'Pentacles' };

