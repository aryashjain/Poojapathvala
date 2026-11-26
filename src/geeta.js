// Geeta Says: verses matched to what a visitor writes, and the emotion pages that link to them.
// The Sanskrit is the ancient verse text. Each meaning, reflection and practice is written for this site.
// Matching runs in the browser; the worry text is never sent anywhere.
export const GITA_VERSES = [
  {
    id: 'overthinking', ref: 'Bhagavad Gita 2.47', keywords: ['future', 'result', 'results', 'outcome', 'overthink', 'overthinking', 'anxious', 'anxiety', 'worry', 'worrying', 'control', 'exam', 'interview', 'career', 'decision'],
    sanskrit: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन । मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥',
    translit: '', meaning: 'Your right is to the effort, never to the fruit. Do not make the result the reason for your action, and do not hide from action either.',
    reflection: 'Much of anxiety is trying to own a result that is not yet in your hands. Put your full attention on the part that is: the next honest step.',
    mantraLine: 'I own my effort today; I release the outcome.', microAction: 'Write down the one smallest task you can finish in the next ten minutes, and begin it.',
  },
  {
    id: 'failure', ref: 'Bhagavad Gita 2.40', keywords: ['fail', 'failure', 'failed', 'mistake', 'waste', 'restart', 'starting over', 'lost time', 'regret', 'effort', 'setback'],
    sanskrit: 'नेहाभिक्रमनाशोऽस्ति प्रत्यवायो न विद्यते । स्वल्पमप्यस्य धर्मस्य त्रायते महतो भयात् ॥',
    translit: '', meaning: 'On a path of sincere effort, nothing is lost. Even a small step on it protects you from a great fear.',
    reflection: 'A setback leaves behind skill, lessons and experience. You are not starting from zero; you are starting from what you now know.',
    mantraLine: 'No sincere effort is ever lost.', microAction: 'Name one skill or lesson from this setback that you did not have six months ago.',
  },
  {
    id: 'self-doubt', ref: 'Bhagavad Gita 6.5', keywords: ['doubt', 'weak', 'worthless', 'confidence', 'stuck', 'myself', 'alone', 'overwhelmed', 'confused', 'lost', 'useless'],
    sanskrit: 'उद्धरेदात्मनात्मानं नात्मानमवसादयेत् । आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः ॥',
    translit: '', meaning: 'Lift yourself by your own mind; do not sink yourself. The mind can be your friend, and it can also be your enemy.',
    reflection: 'Notice the tone you use with yourself. Speak to yourself as you would to a struggling friend, and the mind begins to help rather than harm.',
    mantraLine: 'I choose to be an ally to my own mind.', microAction: 'Replace one harsh sentence you said to yourself today with a plain, kind fact.',
  },
  {
    id: 'loss', ref: 'Bhagavad Gita 2.14', keywords: ['loss', 'grief', 'heartbreak', 'breakup', 'pain', 'change', 'miss', 'sad', 'hurt', 'death', 'ended', 'lonely'],
    sanskrit: 'मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुखदुःखदाः । आगमापायिनोऽनित्यास्तांस्तितिक्षस्व भारत ॥',
    translit: '', meaning: 'Heat and cold, pleasure and pain come and go like the seasons. They are impermanent; bear them with steadiness.',
    reflection: 'This heaviness has a beginning and it will have an end. You do not have to solve it today. Let it move through you without taking your centre.',
    mantraLine: 'This feeling is a passing season, not my permanent home.', microAction: 'Drink a glass of water slowly and step away from screens for five minutes.',
  },
  {
    id: 'anger', ref: 'Bhagavad Gita 2.56', keywords: ['angry', 'anger', 'betrayed', 'unfair', 'hate', 'resentment', 'frustrated', 'mad', 'cheated', 'insult', 'rude'],
    sanskrit: 'दुःखेष्वनुद्विग्नमनाः सुखेषु विगतस्पृहः । वीतरागभयक्रोधः स्थितधीर्मुनिरुच्यते ॥',
    translit: '', meaning: 'The steady mind is not shaken by sorrow, does not hanker after pleasure, and is free of attachment, fear and anger.',
    reflection: 'Anger keeps the other person living rent-free in your mind. Taking back your calm is not weakness; it is the strength to choose.',
    mantraLine: 'I refuse to hand my peace to someone else\'s actions.', microAction: 'Wait at least an hour before you reply, and notice your pulse slow down.',
  },
  {
    id: 'comparison', ref: 'Bhagavad Gita 3.35', keywords: ['compare', 'comparison', 'behind', 'jealous', 'envy', 'others', 'friends', 'success', 'money', 'timeline', 'pressure'],
    sanskrit: 'श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात् । स्वधर्मे निधनं श्रेयः परधर्मो भयावहः ॥',
    translit: '', meaning: 'Your own path, done imperfectly, is better than someone else\'s path done well. Living by another\'s path brings fear.',
    reflection: 'Other people\'s highlights reflect their temperament and timing, not yours. Your own honest step is worth more than a copy.',
    mantraLine: 'I honour my own path and my own pace.', microAction: 'Close one social feed today and spend fifteen minutes on something that is truly yours.',
  },
  {
    id: 'restless', ref: 'Bhagavad Gita 6.35', keywords: ['restless', 'racing', 'sleep', 'focus', 'distracted', 'panic', 'stress', 'burnout', 'tired', 'scattered'],
    sanskrit: 'असंशयं महाबाहो मनो दुर्निग्रहं चलम् । अभ्यासेन तु कौन्तेय वैराग्येण च गृह्यते ॥',
    translit: '', meaning: 'Without doubt, the restless mind is hard to hold. Through steady practice and gentle letting-go, it can be brought to stillness.',
    reflection: 'You do not need to fight the racing thoughts. Gently bring attention back, one breath at a time, again and again.',
    mantraLine: 'Through gentle practice, my mind grows still.', microAction: 'Close the extra browser tabs and give one task fifteen undistracted minutes.',
  },
  {
    id: 'support', ref: 'Bhagavad Gita 9.22', keywords: ['unsupported', 'helpless', 'burden', 'heavy', 'protect', 'faith', 'trust', 'universe', 'alone', 'carry'],
    sanskrit: 'अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते । तेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम् ॥',
    translit: '', meaning: 'For those who keep their mind on the Divine and serve with steady devotion, what they have is protected and what they need is provided.',
    reflection: 'You do not have to carry the whole weight. Do your honest part, and let the rest meet you halfway.',
    mantraLine: 'I do my part with sincerity and trust what unfolds.', microAction: 'Take three slow sighs and let your jaw and hands unclench.',
  },
  {
    id: 'fear', ref: 'Bhagavad Gita 2.3', keywords: ['give up', 'giving up', 'quit', 'weakness', 'coward', 'afraid', 'fear', 'scared', 'courage', 'brave', 'hopeless'],
    sanskrit: 'क्लैब्यं मा स्म गमः पार्थ नैतत्त्वय्युपपद्यते । क्षुद्रं हृदयदौर्बल्यं त्यक्त्वोत्तिष्ठ परन्तप ॥',
    translit: '', meaning: 'Do not give in to weakness; it does not suit you. Drop the small faintness of heart and rise.',
    reflection: 'Fear narrows the world until it looks impossible. Courage does not have to be large; it can be the next small step taken while still afraid.',
    mantraLine: 'I rise one step at a time, even while afraid.', microAction: 'Write the fear on paper, then write one thing you can do about it this week.',
  },
  {
    id: 'equanimity', ref: 'Bhagavad Gita 2.38', keywords: ['ups and downs', 'pleasure', 'pain', 'gain', 'loss', 'victory', 'defeat', 'stress', 'up and down', 'balance', 'unstable', 'emotional'],
    sanskrit: 'सुखदुःखे समे कृत्वा लाभालाभौ जयाजयौ । ततो युद्धाय युज्यस्व नैवं पापमवाप्स्यसि ॥',
    translit: '', meaning: 'Treat pleasure and pain, gain and loss, victory and defeat with the same balance, and then act.',
    reflection: 'Emotions rise and fall like tides. You do not have to be calm to act; you can act while the tide is still moving.',
    mantraLine: 'I act with a steady heart, whatever the day brings.', microAction: 'Name the feeling you have right now in one word, and keep going with your task.',
  },
  {
    id: 'results', ref: 'Bhagavad Gita 2.48', keywords: ['success', 'failure', 'result', 'results', 'attached', 'attachment', 'expectation', 'expectations', 'disappointed', 'disappointment'],
    sanskrit: 'योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय । सिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते ॥',
    translit: '', meaning: 'Act from a settled centre, let go of attachment, and remain even-minded in success and in failure. That evenness is yoga.',
    reflection: 'Expectations turn every outcome into a verdict on your worth. Loosen the grip on the result and the work itself becomes lighter.',
    mantraLine: 'I work with full heart and hold the result loosely.', microAction: 'Write one expectation you are holding, then write what you would do if it did not come true.',
  },
  {
    id: 'let-go', ref: 'Bhagavad Gita 2.50', keywords: ['guilt', 'guilty', 'regret', 'shame', 'past', 'forgive', 'forgiveness', 'sin', 'bad', 'mistake', 'remorse'],
    sanskrit: 'बुद्धियुक्तो जहातीह उभे सुकृतदुष्कृते । तस्माद्योगाय युज्यस्व योगः कर्मसु कौशलम् ॥',
    translit: '', meaning: 'The one who is steady in wisdom sets down both good and bad deeds. Engage in the work with skill; that skill is yoga.',
    reflection: 'Carrying past mistakes as if they were still happening keeps you stuck. Learn what you can, then set the weight down and act now.',
    mantraLine: 'I learn from the past and do not live in it.', microAction: 'Write the regret on paper, underline the lesson, and tear the rest up.',
  },
  {
    id: 'desire', ref: 'Bhagavad Gita 2.62–63', keywords: ['craving', 'desire', 'want', 'addiction', 'addicted', 'obsessed', 'obsession', 'temptation', 'temptations', 'keep thinking', 'ruminating'],
    sanskrit: 'ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते । सङ्गात्सञ्जायते कामः कामात्क्रोधोऽभिजायते ॥',
    translit: '', meaning: 'Dwelling on objects of the senses breeds attachment; attachment breeds desire, and desire breeds anger.',
    reflection: 'A thought repeated becomes a craving, and a craving becomes a storm. Noticing the chain early lets you step out of it.',
    mantraLine: 'I notice the thought, and I do not follow it blindly.', microAction: 'When the same thought returns, name it aloud once and turn to a different task.',
  },
  {
    id: 'ego', ref: 'Bhagavad Gita 3.27', keywords: ['pride', 'proud', 'ego', 'arrogant', 'control everything', 'my fault', 'i did', 'responsible', 'blame', 'blaming'],
    sanskrit: 'प्रकृतेः क्रियमाणानि गुणैः कर्माणि सर्वशः । अहङ्कारविमूढात्मा कर्ताहमिति मन्यते ॥',
    translit: '', meaning: 'Actions are carried out by the qualities of nature, but the confused self thinks, "I am the doer."',
    reflection: 'Much suffering comes from believing that everything depends on you alone. Doing your part is wise; carrying the whole outcome is not your job.',
    mantraLine: 'I do my part, and I am not the only force at work.', microAction: 'List three things in your situation that you cannot control, and let each one go.',
  },
  {
    id: 'injustice', ref: 'Bhagavad Gita 4.7', keywords: ['injustice', 'unfair world', 'corrupt', 'corruption', 'wrong', 'evil', 'despair', 'hopeless about the world', 'dharma', 'truth'],
    sanskrit: 'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत । अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम् ॥',
    translit: '', meaning: 'Whenever righteousness fades and wrong rises, the Divine takes form to restore balance.',
    reflection: 'When the world looks broken, it is natural to despair. Remember that balance is always being restored, and that your own honest action is part of that movement.',
    mantraLine: 'Truth moves slowly, and I keep my part of it.', microAction: 'Choose one honest, small act for someone today, and do it without waiting for applause.',
  },
  {
    id: 'discipline', ref: 'Bhagavad Gita 5.23', keywords: ['impulse', 'impulsive', 'react', 'reacting', 'urge', 'urges', 'self-control', 'control my anger', 'lose my temper', 'temper', 'habit', 'habits'],
    sanskrit: 'शक्नोतीहैव यः सोढुं प्राक्शरीरविमोक्षणात् । कामक्रोधोद्भवं वेगं स युक्तः स सुखी नरः ॥',
    translit: '', meaning: 'The one who can withstand the surge of desire and anger, even before it leaves the body, is steady and truly happy.',
    reflection: 'The surge is strongest in its first moments. Learning to pause in that window is a practice you can build, one moment at a time.',
    mantraLine: 'I feel the surge, and I let it pass before I act.', microAction: 'Before your next reaction, take one slow breath and count to five.',
  },
  {
    id: 'balance', ref: 'Bhagavad Gita 6.16–17', keywords: ['tired', 'exhausted', 'burnout', 'overwork', 'overworked', 'eat', 'eating', 'food', 'sleep', 'habits', 'routine', 'balance', 'too much'],
    sanskrit: 'युक्ताहारविहारस्य युक्तचेष्टस्य कर्मसु । युक्तस्वप्नावबोधस्य योगो भवति दुःखहा ॥',
    translit: '', meaning: 'For one who eats, rests, works and sleeps in measure, yoga removes sorrow.',
    reflection: 'Exhaustion makes every worry louder. Steady rest, simple food and regular sleep quietly calm the mind before any thinking begins.',
    mantraLine: 'Measure brings peace, and rest is part of my practice.', microAction: 'Set a fixed time tonight to stop work, and keep to it.',
  },
  {
    id: 'wandering', ref: 'Bhagavad Gita 6.26', keywords: ['wander', 'wandering', 'mind keeps', 'distracted', 'scattered', 'can not focus', 'cannot focus', 'phone', 'scroll', 'unfocused'],
    sanskrit: 'यतो यतो निश्चरति मनश्चञ्चलमस्थिरम् । ततस्ततो नियम्यैतदात्मन्येव वशं नयेत् ॥',
    translit: '', meaning: 'Wherever the restless, unsteady mind wanders, bring it back and place it under the control of the self.',
    reflection: 'The mind will wander; that is its nature. Returning it gently is the practice, and each return counts.',
    mantraLine: 'Each time I return, I grow steadier.', microAction: 'Put the phone in another room for twenty minutes and bring your attention back to one thing.',
  },
  {
    id: 'compassion', ref: 'Bhagavad Gita 12.13', keywords: ['forgive', 'forgiveness', 'kindness', 'compassion', 'resent', 'enemy', 'hatred', 'hard feelings', 'peace with others', 'kind'],
    sanskrit: 'अद्वेष्टा सर्वभूतानां मैत्रः करुण एव च । निर्ममो निरहङ्कारः समदुःखसुखः क्षमी ॥',
    translit: '', meaning: 'The one who bears no hatred toward any being, who is friendly and compassionate, free of "mine" and "I", equal in pain and pleasure, and patient, is dear to the Divine.',
    reflection: 'Forgiveness is not agreeing with what was done. It is putting down the weight so that you can walk on.',
    mantraLine: 'I wish peace to others, and I keep my own heart free.', microAction: 'Send one kind message today to someone you have been holding a grudge against, or simply wish them well in silence.',
  },
  {
    id: 'kindness', ref: 'Bhagavad Gita 12.15', keywords: ['annoyed', 'irritated', 'people irritate', 'peace', 'calm', 'joy', 'envy', 'fear of others', 'others', 'respect'],
    sanskrit: 'यस्मान्नोद्विजते लोको लोकान्नोद्विजते च यः । हर्षामर्षभयोद्वेगैर्मुक्तो यः स च मे प्रियः ॥',
    translit: '', meaning: 'The one who does not trouble the world, and whom the world does not trouble, free of joy, anger, fear and anxiety, is dear to the Divine.',
    reflection: 'Peace is found when you neither disturb others nor let others disturb your inner calm.',
    mantraLine: 'I do not trouble others, and I do not let them trouble my peace.', microAction: 'Take a short walk without your phone and notice three quiet things around you.',
  },
  {
    id: 'obstacles', ref: 'Bhagavad Gita 18.58', keywords: ['obstacle', 'obstacles', 'blocked', 'stuck', 'cannot move', 'hard', 'difficult', 'problem', 'problems', 'hurdle', 'struggle'],
    sanskrit: 'मच्चित्तः सर्वदुर्गाणि मत्प्रसादात्तरिष्यसि । अथ चेत्त्वमहङ्कारान्न श्रोष्यसि विनङ्क्ष्यसि ॥',
    translit: '', meaning: 'Keep your mind on the Divine, and by that grace you will cross every difficulty.',
    reflection: 'Obstacles look different when you hold them in a larger context. Steady your mind first; the path tends to open after that.',
    mantraLine: 'I steady my mind, and the way opens.', microAction: 'Write the one obstacle in front of you, then one small way to get around it.',
  },
  {
    id: 'surrender', ref: 'Bhagavad Gita 18.66', keywords: ['surrender', 'let go', 'guilt', 'afraid of consequences', 'lost', 'help', 'seek help', 'refuge', 'faith', 'god', 'prayer', 'pray'],
    sanskrit: 'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज । अहं त्वा सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः ॥',
    translit: '', meaning: 'Let go of every rigid idea and take refuge in the Divine. Do not grieve; you will be released from every burden.',
    reflection: 'Surrender does not mean giving up on your effort. It means holding your effort in trust, and setting down what you were never meant to carry alone.',
    mantraLine: 'I take refuge, and I put down what is too heavy.', microAction: 'Say one prayer, or one honest sentence of trust, out loud before you sleep tonight.',
  },
];

// Emotion pages: /geeta-says/<slug>. Each opens with its verse already shown.
export const EMOTIONS = {
  'overthinking': { verse: 'overthinking', title: 'Overthinking the future', lede: 'A Bhagavad Gita verse for overthinking, and a one-minute reset to bring you back to today.' },
  'anxiety': { verse: 'overthinking', title: 'Anxiety', lede: 'A Bhagavad Gita verse for anxiety about results, with a one-minute calm reset.' },
  'fear-of-failure': { verse: 'failure', title: 'Fear of failure', lede: 'A Bhagavad Gita verse for fear of failing and starting over, with a one-minute reset.' },
  'heartbreak': { verse: 'loss', title: 'Heartbreak and loss', lede: 'A Bhagavad Gita verse for grief and heartbreak, with a one-minute reset to steady you.' },
  'anger': { verse: 'anger', title: 'Anger and betrayal', lede: 'A Bhagavad Gita verse for anger and feeling wronged, with a one-minute reset.' },
  'self-doubt': { verse: 'self-doubt', title: 'Self-doubt', lede: 'A Bhagavad Gita verse for self-doubt and feeling lost, with a one-minute reset.' },
  'comparison': { verse: 'comparison', title: 'Comparison and pressure', lede: 'A Bhagavad Gita verse for comparing yourself to others, with a one-minute reset.' },
};

export function verseById(id) {
  return GITA_VERSES.find((v) => v.id === id) || GITA_VERSES[0];
}
