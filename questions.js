const grammarQuestions = {
    level1: [
        {
            question: "She seems to be confident in her presentation.",
            options: [
                "She is pretending to be confident.",
                "It appears she is confident, but it’s not confirmed.", // Correct
                "She is definitely confident."
            ],
            correct: 1,
            explanation: "'Seem' indicates an impression or observation, but it does not confirm certainty."
        },
        {
            question: "What does he mean by saying, 'I'll try to finish it by tomorrow'?",
            options: [
                "He does not intend to finish it at all.",
                "He will definitely complete it.",
                "He is unsure but will make an effort to complete it." // Correct
            ],
            correct: 2,
            explanation: "'Mean' in this context refers to intention and effort, not certainty."
        },
        {
            question: "Suppose we leave the party early, would that be okay?",
            options: [
                "It’s a hypothetical suggestion to consider.", // Correct
                "We are definitely leaving early.",
                "We are refusing to stay at the party."
            ],
            correct: 0,
            explanation: "'Suppose' introduces a hypothetical scenario for consideration."
        }
    ],
    level2: [
        {
            question: "He seems to have overlooked the details in the report.",
            options: [
                "It appears he missed the details, but it’s not confirmed.", // Correct
                "He plans to check the details later.",
                "He deliberately ignored the details."
            ],
            correct: 0,
            explanation: "'Seem' indicates an impression based on observation, but it’s not a certainty."
        },
        {
            question: "When she says, 'I need some space,' what does she mean?",
            options: [
                "She needs more physical space around her.",
                "She wants to take a break for a short time.", // Correct
                "She is moving to a new house."
            ],
            correct: 1,
            explanation: "'Mean' here suggests an implied emotional or personal need for distance, not a literal one."
        },
        {
            question: "I suppose I could lend you the book, but I’ll need it back soon.",
            options: [
                "The speaker is considering lending the book, but it depends.", // Correct
                "The speaker refuses to lend the book.",
                "The speaker is sure about lending the book."
            ],
            correct: 0,
            explanation: "'Suppose' expresses uncertainty or hesitation while still leaving the option open."
        }
    ],
    level3: [
        {
            question: "It seems as if they are avoiding each other.",
            options: [
                "They will start avoiding each other soon.",
                "It looks like they are avoiding each other, but it’s not confirmed.", // Correct
                "They are definitely avoiding each other."
            ],
            correct: 1,
            explanation: "'Seem' here suggests an observation or impression, not a confirmed fact."
        },
        {
            question: "What does he mean when he says, 'That’s not how I intended it'?",
            options: [
                "He is denying that he made a mistake.",
                "He is explaining that his original intention was different.", // Correct
                "He is apologizing for forgetting something."
            ],
            correct: 1,
            explanation: "'Mean' refers to clarifying the intended purpose of the action or statement."
        },
        {
            question: "Suppose you had prepared earlier, would the outcome have been different?",
            options: [
                "The speaker is asking about future preparation.",
                "The speaker is discussing a confirmed result.",
                "The speaker is considering a past hypothetical scenario." // Correct
            ],
            correct: 2,
            explanation: "'Suppose' introduces a hypothetical scenario in the past for reflection."
        }
    ],
    level4: [
        {
            question: "It seems everyone has forgotten the instructions.",
            options: [
                "It’s obvious that everyone forgot.",
                "Everyone is about to forget the instructions.",
                "It looks like everyone forgot, but it’s not certain." // Correct
            ],
            correct: 2,
            explanation: "'Seem' implies an impression or appearance, not certainty."
        },
        {
            question: "When she says, 'I didn’t mean to offend you,' what is she expressing?",
            options: [
                "She unintentionally caused offense and regrets it.", // Correct
                "She intended to offend but regrets it.",
                "She does not regret causing offense."
            ],
            correct: 0,
            explanation: "'Mean' here indicates that the action was accidental and regrettable."
        },
        {
            question: "Suppose the deadline is extended, how would that impact the project?",
            options: [
                "The project will fail regardless of the extension.",
                "The deadline will definitely be extended.",
                "The speaker is introducing a hypothetical scenario to consider." // Correct
            ],
            correct: 2,
            explanation: "'Suppose' is used to introduce a possibility or hypothetical scenario for discussion."
        }
    ],
    level5: [
        {
            question: "It seems as though she is avoiding responsibility for the mistake.",
            options: [
                "She is definitely avoiding responsibility.",
                "It looks like she is avoiding responsibility, but it’s not confirmed.", // Correct
                "She has already accepted responsibility but is pretending otherwise."
            ],
            correct: 1,
            explanation: "'Seem' suggests an appearance or impression, not confirmed reality."
        },
        {
            question: "What does he mean by saying, 'I didn’t mean to upset you'?",
            options: [
                "He denies causing any upset at all.",
                "He unintentionally caused upset and regrets it.", // Correct
                "He intended to upset but now regrets it."
            ],
            correct: 1,
            explanation: "'Mean' here conveys that the upsetting action was unintended and regrettable."
        },
        {
            question: "Suppose we had more time to prepare, what would we do differently?",
            options: [
                "The speaker is explaining what happened in the past.",
                "The speaker is giving instructions for future actions.",
                "The speaker is asking about a hypothetical situation." // Correct
            ],
            correct: 2,
            explanation: "'Suppose' is used to prompt consideration of a hypothetical scenario."
        }
    ]
};
.
