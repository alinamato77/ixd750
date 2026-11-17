'use strict';

// Editable sample cases. Reading indices refer to sentences in each party’s account, starting at zero.
const cases = [
  {
    "name": "Identical ice cream",
    "relationship": "Roommates",
    "background": "They share a freezer. Each bought a tub of the same brand and flavor of ice cream.",
    "sides": [
      "I saw B eating the exact ice cream I buy. I thought it was mine. I want a heads-up before anyone eats my food. When B said she bought the same flavor, I wondered why she was copying me. I’m still upset that she didn’t apologize.",
      "I bought that brand and flavor because I like it too. I ate from the tub I believed was mine. It hurt to be accused of taking her food and then of copying her. I’d like her to ask me what happened before expecting an apology."
    ],
    "keywords": [
      "unresolved",
      "ask others to check",
      "same flavor"
    ],
    "steps": [
      "Acknowledge that matching flavors alone cannot identify the tub, and apologize for jumping to a conclusion.",
      "Explain which tub you thought was yours. If you discover you took A’s, offer to replace it.",
      "Check the tubs together. If ownership is still unclear, leave it open and label the lids with your initials."
    ],
    "issue": "The tubs look identical. Can either roommate identify the one B opened?",
    "painPoints": {
      "a": [
        [
          "A believes B ate from the tub A bought.",
          "I thought it was mine."
        ],
        [
          "A wants to be asked before anyone eats their food.",
          "I want a heads-up before anyone eats my food."
        ],
        [
          "A is still hurt that B has not apologized.",
          "I’m still upset that she didn’t apologize."
        ]
      ],
      "b": [
        [
          "B feels wrongly accused of taking A’s food and of copying.",
          "It hurt to be accused of taking her food and then of copying her."
        ],
        [
          "B wants to buy a flavor they like without it being called copying.",
          "I bought that brand and flavor because I like it too."
        ],
        [
          "B wants A to ask what happened before expecting an apology.",
          "I’d like her to ask me what happened before expecting an apology."
        ]
      ]
    },
    "readings": [
      [
        "Not enough context",
        "Both bought the same ice cream. Seeing B eat that flavor does not identify the tub.",
        0,
        0
      ],
      [
        "Side B",
        "B’s own purchase offers another explanation for what A saw. The shared flavor alone does not establish copying or taking.",
        1,
        0
      ],
      [
        "Not enough context",
        "A states a boundary. The accounts do not establish an earlier agreement or whose tub was opened.",
        2,
        1
      ],
      [
        "Not enough context",
        "A wants her belongings respected. B wants to be asked before being blamed. Both concerns can be acknowledged.",
        2,
        2
      ]
    ],
    "alternates": [
      [
        "Both equally",
        "Each account rests on a belief about whose tub it was. Neither names a mark or receipt that tells the tubs apart, so both are equally checkable once they look in the freezer together.",
        1,
        1
      ],
      [
        "Both equally",
        "A’s conclusion and B’s denial both depend on which tub was opened. Neither line of reasoning reaches past that missing detail.",
        3,
        1
      ],
      [
        "Both equally",
        "Neither side cites an earlier house rule. A’s request for a heads-up and B’s request to be asked first are both reasonable rules to agree on now.",
        2,
        3
      ],
      [
        "Side B",
        "B names how the accusation felt and asks for a conversation first. A’s account does not yet mention how B was affected.",
        4,
        3
      ]
    ],
    "overall": "Whose tub B opened is unresolved. A can ask others to check before taking her food, and B can choose the same flavor.",
    "solution": "A could say, “I care about people asking before taking my food. I jumped to a conclusion, and I’m sorry I accused you.” Check the tubs together. If B realizes she opened A’s, she can apologize and replace it. If they still cannot tell, leave ownership unresolved and put initials on the lids next time."
  },
  {
    "name": "The grocery split",
    "relationship": "Roommates",
    "background": "One receipt lists $18 in cleaning supplies and $12 in coffee for A. They agreed by text to split shared cleaning supplies equally and pay for personal groceries separately.",
    "sides": [
      "I paid the $30 bill and asked B for $15. I picked everything up in one trip, so splitting the receipt in half felt simple. I can show B the itemized receipt.",
      "We agreed to split the cleaning supplies. I don’t drink the coffee A bought for herself. I’m happy to send $9 for my half of the supplies."
    ],
    "keywords": [
      "$9",
      "$12",
      "personal coffee"
    ],
    "steps": [
      "Show the itemized receipt and separate the $12 coffee from the shared supplies.",
      "Pay $9 for half of the $18 in shared supplies. If you already sent $15, ask for the $6 difference.",
      "Mark shared items before splitting the next receipt, so each roommate can check the total."
    ],
    "issue": "Should they split the whole receipt or only the cleaning supplies covered by their agreement?",
    "painPoints": {
      "a": [
        [
          "A paid the whole bill up front and wants to be paid back.",
          "I paid the $30 bill and asked B for $15."
        ],
        [
          "A feels one shopping trip should mean one simple split.",
          "I picked everything up in one trip, so splitting the receipt in half felt simple."
        ]
      ],
      "b": [
        [
          "B feels the agreement covers only the cleaning supplies.",
          "We agreed to split the cleaning supplies."
        ],
        [
          "B doesn’t want to pay for coffee A bought for themself.",
          "I don’t drink the coffee A bought for herself."
        ],
        [
          "B is ready to pay their half of the shared supplies.",
          "I’m happy to send $9 for my half of the supplies."
        ]
      ]
    },
    "readings": [
      [
        "Side B",
        "The shared receipt details support B’s calculation: half of $18 is $9.",
        0,
        2
      ],
      [
        "Side B",
        "Halving the total is convenient, but includes $6 for A’s personal coffee in B’s share.",
        1,
        1
      ],
      [
        "Side B",
        "Their earlier text sets the rule: shared supplies are split and personal groceries are paid for individually.",
        1,
        0
      ],
      [
        "Both equally",
        "A offers to show the receipt and B offers to pay for the shared items. Both offers can help settle the amount.",
        2,
        2
      ]
    ],
    "alternates": [
      [
        "Both equally",
        "A offers the itemized receipt and B cites exact figures. Together they can check the split line by line.",
        2,
        2
      ],
      [
        "Side B",
        "B ties the amount to the agreement. A’s reason is convenience, which does not change who owes what.",
        1,
        0
      ],
      [
        "Not enough context",
        "The agreement is described in the background, not shown. Reading the text message together would confirm that it covers only cleaning supplies.",
        0,
        0
      ],
      [
        "Side A",
        "A carried the cost and the errand for both and offers to show the receipt, which makes checking easy for B.",
        2,
        2
      ]
    ],
    "overall": "Under the stated agreement, B owes $9. A’s share is the other $9 for supplies plus $12 for coffee.",
    "solution": "Look at the receipt together and mark the two categories. B sends A $9. If B already sent $15, A returns $6. On the next shared shop, total the shared items before dividing by two."
  },
  {
    "name": "The airport pickup",
    "relationship": "Couples",
    "background": "A and B planned an early ride to the airport. A took a taxi after B was delayed.",
    "sides": [
      "As my partner, I expected reliability and care for an early, stressful flight. When 6:30 rolled around and B wasn’t here, I felt abandoned and panicked, forcing me to spend $35 on a taxi. Even in a relationship, respect for my time and peace of mind matters; since B was late, B should cover the taxi.",
      "We're partners, which means supporting each other through unexpected crises, not treating each other like a rideshare service. I left on time, but a sudden highway crash trapped me. I texted at 6:20 as soon as I could. When I got there at 6:40, A had vanished without a word. I'm happy to split the cost, but it hurts that A didn't trust me or check in before bailing."
    ],
    "issue": "What did each partner know when A decided to take a taxi, and how should they handle the fare?",
    "painPoints": {
      "a": [
        [
          "A felt abandoned while waiting for a time-sensitive ride.",
          "I felt abandoned and panicked"
        ],
        [
          "A wants help with the unexpected fare.",
          "B should cover the taxi."
        ]
      ],
      "b": [
        [
          "B says a crash delayed the pickup and a message was sent.",
          "I texted at 6:20 as soon as I could."
        ],
        [
          "B felt hurt when A left.",
          "it hurts that A didn't trust me or check in before bailing."
        ]
      ]
    },
    "keywords": [
      "$35",
      "message",
      "pickup"
    ],
    "steps": [
      "Explain what you knew at 6:30 and how waiting affected you.",
      "Acknowledge the stress, then explain what your 6:20 message said. Ask what A saw.",
      "Check when the message reached A, discuss the $35, and choose a cutoff time and backup ride for the next pickup."
    ],
    "readings": [
      [
        "Both equally",
        "Both give times that they can check together.",
        1,
        2
      ],
      [
        "Not enough context",
        "Neither account establishes when A saw the message or what it said.",
        1,
        2
      ],
      [
        "Not enough context",
        "The pickup was planned. No account gives an agreement about a backup fare.",
        2,
        4
      ],
      [
        "Both equally",
        "A describes a need for reliability and B offers to share the cost.",
        0,
        4
      ]
    ],
    "alternates": [
      [
        "Not enough context",
        "Sending a text does not establish when it was received.",
        1,
        2
      ],
      [
        "Both equally",
        "Each describes a reason for acting under time pressure.",
        1,
        1
      ],
      [
        "Not enough context",
        "They can compare their understanding of the pickup cutoff.",
        2,
        3
      ],
      [
        "Not enough context",
        "Each describes their own experience. What each knew about the other is still open.",
        0,
        4
      ]
    ],
    "overall": "A needed a reliable pickup and B reports a delay. What A knew before leaving matters to the discussion about the $35 fare.",
    "solution": "Each partner can describe one impact and check the message together. Then discuss a fair contribution and agree on a backup plan."
  }
];
