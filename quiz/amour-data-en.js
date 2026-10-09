/* Quiz Amour, version anglaise : mêmes clés que amour-data.js, textes seulement.
   Fusionnée sur la base française par AmourEngine.withLanguage quand la langue du quiz est "en".
   Les identifiants, scores et ordres restent ceux de amour-data.js. Textes relus à la main : on les corrige directement ici. Testé par quiz/amour-en.test.mjs. */
(function (root) {
const AMOUR_DATA_EN = {
  "profil": {
    "alliages": {
      "securite+profondeur": "You want something solid and real. You commit slowly, but when you commit, it's deeply: you want to know the other person and be able to count on them. Your challenge: accepting that you won't have all the answers right away.",
      "securite+admiration": "You need a reliable bond and eyes that value you. You give a lot to make the relationship last, and you need that to be seen. Your challenge: asking for recognition instead of waiting for it to come on its own.",
      "securite+liberte": "You want a home port and room to breathe. It's a rare and precious mix: a stable relationship where each person keeps their own life. Your challenge: stating both needs clearly, so the other person doesn't think you're blowing hot and cold.",
      "securite+harmonie": "You dream of a gentle, safe home. You bring consistency and peace, 2 things that do good over time. Your challenge: not confusing peace with silence, and daring to put sensitive topics on the table.",
      "securite+complicite": "You want a solid team that laughs together. For you, a relationship means projects and fits of laughter, rituals and jokes. Your challenge: keeping things light, even when organising takes up all the space.",
      "securite+intensite": "You want the flame and the home port. You need things to spark, but not to rock. Your challenge: accepting that a stable relationship can also be intense, and that an intense relationship isn't necessarily unstable.",
      "profondeur+admiration": "You want to be truly seen, even in what you hide. Surface compliments aren't enough: you want to be admired for who you are. Your challenge: showing your vulnerable side too, because that's where the other person can love all of you.",
      "profondeur+liberte": "You have a rich inner life, and you need time alone to enjoy it. You love conversations that go far, then finding some quiet. Your challenge: saying when you're stepping back, so the other person doesn't take it as rejection.",
      "profondeur+harmonie": "You love gently and sincerely. You listen, you understand, you soothe. Your challenge: also saying what hurts you, without waiting for the other person to guess.",
      "profondeur+complicite": "You want to be able to say everything and laugh about everything with the same person. You go from a deep talk to a fit of laughter, and that's your strength. Your challenge: not using humour to dodge what hurts.",
      "profondeur+intensite": "You love strongly and for real. You look for a rare connection, exchanges that leave a mark, a relationship like no other. Your challenge: leaving room for calm, without believing love is fading.",
      "admiration+liberte": "You want to shine and stay free. You need a partner who is proud of you and doesn't hold you back. Your challenge: offering your presence too, so the other person doesn't feel like a spectator of your life.",
      "admiration+harmonie": "You need sweet words and eyes that value you. You give a lot of kindness, and you need it to come back to you. Your challenge: saying what you expect, rather than fading into the background hoping to be noticed.",
      "admiration+complicite": "You want a partner who cheers you on and laughs with you. You bring life and warmth wherever you go. Your challenge: accepting calmer moments without believing love is fading.",
      "admiration+intensite": "You love with flair. You want to feel desired, chosen, admired, and for it to show. Your challenge: remembering that consistency is also proof of love, even when it makes less noise.",
      "liberte+harmonie": "You want a light relationship, in the good sense of the word: no pressure, no shouting, no control. You leave the other person free and expect the same. Your challenge: not running from disagreements in the name of peace.",
      "liberte+complicite": "You want a partner in crime, not someone who holds you back. Laughing, leaving, meeting up again: that's your way of loving. Your challenge: accepting a few rules, as they protect your freedom instead of shrinking it.",
      "liberte+intensite": "You love adventure, novelty, momentum. For you, a relationship is a journey. Your challenge: staying when the excitement of the early days fades, because that's often where the best part begins.",
      "harmonie+complicite": "You want a gentle, joyful daily life. You create an atmosphere where people simply feel good. Your challenge: keeping your voice when a topic gets touchy, instead of smoothing everything over.",
      "harmonie+intensite": "You want tenderness and the flame. You need gentleness every day and moments that make you come alive. Your challenge: accepting that intensity sometimes shakes up the peace, and that it's OK.",
      "complicite+intensite": "You want a lively story: laughing, daring, surprising. With you, there's no room for boredom. Your challenge: also making room for simple moments and serious conversations."
    },
    "couples": {
      "securite+complicite": {
        "text": "You make a real team: one sets the landmarks, the other brings the good mood. Projects move forward, and you laugh along the way."
      },
      "admiration+complicite": {
        "text": "You bring out the best in each other. Encouragement, laughter and outings together do you both good."
      },
      "admiration+intensite": {
        "text": "You admire and desire each other. Each of you feels chosen, and the relationship doesn't fall asleep."
      },
      "liberte+intensite": {
        "text": "You share a taste for adventure and respect for each other's space. Nobody holds the other back, and that's what brings you closer."
      },
      "liberte+harmonie": {
        "text": "One needs room to breathe, the other needs calm: you let each other breathe without tension. Reunions are gentle, without reproaches."
      },
      "profondeur+harmonie": {
        "text": "Gentleness and listening: you can tell each other everything without fear. The ideal ground for opening up and growing together."
      },
      "securite+profondeur": {
        "text": "One wants something real, the other something solid: together, you build deep trust. Promises are kept and important things are said."
      },
      "securite+liberte": {
        "text": "One looks for landmarks, the other for room to breathe. At first, it balances out. Then come “you're never here” and “you're smothering me”. To settle early: how often you meet up and keep in touch."
      },
      "admiration+liberte": {
        "text": "One lives their own life, the other needs to be seen and celebrated. The risk: one feels forgotten and the other feels watched. It works with moments just for the 2 of you, announced and kept."
      },
      "profondeur+admiration": {
        "text": "One needs to shine and be recognised, the other needs truth and intimacy. The risk: one finds the other too serious, and the other finds the first too superficial. It works if each says what they admire in the other."
      },
      "profondeur+complicite": {
        "text": "One wants to talk about the deep stuff, the other prefers to lighten things up. At first, it's charming. Then come “you dodge everything with humour” and “you make a drama of everything”. It works with time to laugh and time to talk, without mixing them up."
      },
      "harmonie+complicite": {
        "text": "One wants things lively, the other wants peace and quiet. Evenings, weekends and invitations become issues. It works if each keeps their outings or their calm evenings, without guilt."
      },
      "harmonie+intensite": {
        "text": "One looks for peace, the other for the spark. What makes one come alive wears the other out. It works when intensity comes through passion and novelty, never through arguments."
      },
      "securite+intensite": {
        "text": "One wants things to spark, the other wants them to last. The first finds the second too calm, the second finds the first too unstable. It works if adventure is planned a little, and routine accepts a few surprises."
      },
      "securite+harmonie": {
        "text": "The same need for peace and stability: life together is simple. Be careful not to let routine put desire to sleep."
      },
      "securite+admiration": {
        "text": "One brings consistency, the other warm words. It runs smoothly, as long as you often say thank you."
      },
      "profondeur+liberte": {
        "text": "You both need time to yourselves and a rich inner life. You understand each other without having to justify yourselves. Be careful to keep moments that are truly shared."
      },
      "liberte+complicite": {
        "text": "Lightness and freedom: you feel good, with no pressure. Be careful to still set some shared plans."
      },
      "admiration+harmonie": {
        "text": "Kindness and words that lift you up: you know how to do each other good. Be careful to dare to disagree."
      },
      "profondeur+intensite": {
        "text": "A strong, almost magnetic bond. Be careful to keep steady landmarks to avoid the rollercoaster."
      },
      "complicite+intensite": {
        "text": "A lively relationship, full of ideas and fits of laughter. Be careful to keep room for seriousness and rest."
      },
      "securite+securite": {
        "text": "2 Security profiles: a solid home, fast. Plan new things together, so comfort doesn't replace desire."
      },
      "profondeur+profondeur": {
        "text": "2 Depth profiles: endless conversations, a rare intimacy. Remember to have fun and lighten up too."
      },
      "admiration+admiration": {
        "text": "2 Admiration profiles: you know how to lift each other up. Be careful not to fight over the spotlight."
      },
      "liberte+liberte": {
        "text": "2 Freedom profiles: no pressure, lots of respect. Be careful not to turn into flatmates."
      },
      "harmonie+harmonie": {
        "text": "2 Harmony profiles: gentleness at every moment. Watch out for the unsaid piling up, because nobody dares to argue."
      },
      "complicite+complicite": {
        "text": "2 Closeness profiles: a joyful team. Be careful not to run from serious topics."
      },
      "intensite+intensite": {
        "text": "2 Intensity profiles: a magnetic passion. Watch out for the rollercoaster and jealousy."
      }
    },
    "pieges": {
      "fight": {
        "name": "escalation",
        "title": "Escalation",
        "short": "you rev up so you don't lose",
        "mech": "When you're afraid of losing the other person or of not being heard, you rev up: the tone, the arguments, the last word. In the moment, it looks like strength. In reality, it's fear, and the other person only hears the noise.",
        "exits": [
          "Notice your body's signal (heat, a rising voice): that's the moment to stop, not to speed up.",
          "Say “I'm taking a 20-minute break and I'll be back”, then really come back.",
          "When you come back, start with what you feel, not with what the other person did: “I was scared that...”"
        ],
        "exitShort": "announce a 20-minute break, then really come back"
      },
      "flight": {
        "name": "the exit door",
        "title": "The exit door",
        "short": "you escape so you don't explode",
        "mech": "When tension rises, you leave: physically, into your phone, into work. You think you're protecting the relationship. The other person experiences your leaving as abandonment, and the tension comes back stronger next time.",
        "exits": [
          "You're allowed to take a break. Announce it, instead of disappearing.",
          "Set the time to talk about it again right away: “Let's talk about it tonight, at 9 pm.”",
          "Come back with just 1 true sentence, even a short one: that's what reassures."
        ],
        "exitShort": "announce your break and set right away the time you'll talk about it again"
      },
      "freeze": {
        "name": "the blank",
        "title": "The blank",
        "short": "your mind goes blank and the words stop coming",
        "mech": "When it gets too much, your mind goes blank. No more words, no more ideas. The other person may see indifference, when you're actually overwhelmed, and their insistence freezes you even more.",
        "exits": [
          "Prepare your rescue sentence in advance: “I'm stuck, give me a moment, I'll come back to you.”",
          "Breathe slowly, put your feet flat on the floor: your body needs to calm down before your head.",
          "If talking is too hard, write down what you feel, and hand it over afterwards."
        ],
        "exitShort": "say your rescue sentence, “I'm stuck, I'll come back to you”, and come back"
      },
      "fawn": {
        "name": "the costly yes",
        "title": "The costly yes",
        "short": "you give in so it stops",
        "mech": "To make the argument stop, you say yes, apologise, give in. Calm returns quickly, but your need gets lost along the way. Over time, it builds up, and you end up drifting away without a word.",
        "exits": [
          "Replace the automatic yes with: “I'm not sure, I'll think about it and let you know.”",
          "Before giving in, ask yourself: what do I need, right here, right now?",
          "Say 1 true thing a day, even a small one. It can be trained, like a muscle."
        ],
        "exitShort": "replace the automatic yes with “I'll think about it and let you know”"
      }
    },
    "besoins": {
      "securite": {
        "name": "Security",
        "key": "I need to know who I can count on.",
        "noun": "Anchor",
        "adj": "Loyal",
        "lower": "security",
        "de": "security",
        "who": "someone steady, who keeps their word and likes landmarks",
        "s1": "love by building something solid, with someone you can count on",
        "secNeed": "to be able to count on the other person, over time",
        "bloomShort": "the other person keeps their word and you make plans together",
        "fadeShort": "vagueness sets in and promises are left hanging",
        "bloom": "You give your best in a stable relationship, where everyone does what they say. Regularity doesn't bore you: it relaxes you. When you know where you're heading, you stop being on your guard and show all your tenderness.",
        "bloomList": [
          "A partner who lets you know when something comes up, without you having to ask.",
          "Plans decided together: a trip booked, a flat, a date in the diary.",
          "Rituals that come back: the evening message, Sunday dinner."
        ],
        "secBloom": "you also need landmarks, and for the other person to keep their word",
        "fade": "What wears you down isn't a big drama, it's uncertainty that drags on. An unanswered message, a postponed plan, an unpredictable mood, and you go on your guard. You ask questions, you keep watch, and the other person may think you're controlling them, when you just need reassurance.",
        "fadeList": [
          "Plans that change at the last minute, with no explanation.",
          "“We'll see” as the only answer to “where are we going, the 2 of us?”.",
          "A partner who is warm one day and distant the next."
        ],
        "alarm": "If you catch yourself checking, chasing or guessing the other person's mood several times a day, you're not “too much”: it's your need for security sounding the alarm.",
        "secFade": "vagueness that drags on always ends up weighing on you",
        "rel": {
          "rythme": "A regular rhythm, with dates that come back. The unexpected suits you as long as it stays the exception.",
          "proximite": "Steady closeness: seeing each other often, keeping in touch, without necessarily doing everything together.",
          "independance": "Each of you can have your own life, as long as the rules are clear: who does what, when you see each other, what stays just for the 2 of you.",
          "conflits": "You need conflicts to end with a clear decision. An argument left hanging plays on your mind for days."
        },
        "secCond": "commitments kept, even small ones",
        "partnerFond": "someone steady, who reassures you through actions more than promises",
        "sayPartner": [
          "“I need to know I can count on you. When you do what you say, I relax.”",
          "“If something comes up, let me know, even with a quick word. It changes everything for me.”",
          "“I'd love for us to talk about our plans for the year ahead.”"
        ],
        "sayDate": [
          "“I like knowing where we're heading, without rushing things.”",
          "A question to ask: “What matters most to you in a lasting relationship?”"
        ],
        "trigger": "you feel the bond is no longer safe: a silence, a doubt, a forgotten promise",
        "calm": "a sentence that reassures you about the 2 of you, before looking for a solution",
        "rencontre": {
          "lieux": [
            {
              "texte": "A local coffee shop where people know you"
            },
            {
              "texte": "A hiking club that meets every week"
            },
            {
              "texte": "A neighbourhood association, with regular get-togethers"
            }
          ],
          "activites": [
            {
              "texte": "Cooking for a small group, the same evening every week"
            },
            {
              "texte": "A craft workshop where the project moves forward step by step"
            },
            {
              "texte": "Volunteering in a steady team"
            }
          ],
          "brilles": {
            "texte": "You show your best side in a small, loyal group, where everyone knows where they stand."
          },
          "eviter": {
            "texte": "Parties where nobody knows each other, and everything is decided at the last minute."
          },
          "talent": "When you do what you truly enjoy, you meet people who are like you. Your Unique Talent is right there, in that enjoyment: in love, it's the same."
        }
      },
      "profondeur": {
        "name": "Depth",
        "key": "I need to be truly known, not just loved.",
        "noun": "Mirror",
        "adj": "Deep",
        "lower": "depth",
        "de": "depth",
        "who": "someone who loves real conversations and dares to talk about what they feel",
        "s1": "love deeply, with real conversations and an open heart",
        "secNeed": "to be able to say everything, even what makes you vulnerable",
        "bloomShort": "you can say everything and the other person truly tries to understand you",
        "fadeShort": "the relationship stays on the surface and nobody talks about their feelings",
        "bloom": "You blossom when you can tell the other person everything. An evening talking about your dreams and fears does you more good than a fancy restaurant. When you feel understood, your loyalty and your listening are rare.",
        "bloomList": [
          "A partner who asks questions and listens to the whole answer.",
          "Conversations that go on late, with no phone on the table.",
          "The right to be sad, worried or moved without being judged."
        ],
        "secBloom": "you also need real conversations, not just good times",
        "fade": "What switches you off is feeling alone even as a couple. A partner who changes the subject, mocks your sensitivity or always has their mind elsewhere, and you're left alone with what you're going through. Little by little, you go quiet, and the relationship empties without a sound.",
        "fadeList": [
          "“You're overthinking it” in reply to what moves you.",
          "Silences that last for days after an argument.",
          "A partner who is there in body, absent in their head."
        ],
        "alarm": "If you catch yourself keeping what matters most to yourself, because “they won't understand anyway”, your need for depth is no longer being fed.",
        "secFade": "a relationship that stays on the surface ends up leaving you alone even as a couple",
        "rel": {
          "rythme": "A rhythm that leaves time to really talk: fewer outings, more real moments.",
          "proximite": "Being very close at heart: knowing what the other person is living, feeling, hoping for.",
          "independance": "You accept physical distance, not emotional distance. Your partner can travel, as long as they tell you about it.",
          "conflits": "You need to talk until you understand. An argument swept aside without explaining stays with you."
        },
        "secCond": "regular moments to really talk",
        "partnerFond": "someone who is interested in what's going on inside you, and who dares to talk about what's going on inside them",
        "sayPartner": [
          "“Tonight, I'd love for us to really talk. Not about logistics: about us.”",
          "“When I tell you something that moves me, I just need you to listen to the end.”",
          "“Tell me 1 thing you've never dared to tell me. I'm listening, without judging.”"
        ],
        "sayDate": [
          "“I'd rather have 1 real conversation than 10 light topics.”",
          "A question to ask: “What has helped you grow the most in recent years?”"
        ],
        "trigger": "you feel misunderstood, or when the other person shuts down instead of talking",
        "calm": "to be listened to without being corrected, even for 2 minutes",
        "rencontre": {
          "lieux": [
            {
              "texte": "A quiet coffee shop, where the conversation can go on"
            },
            {
              "texte": "A book club where people really talk about the books"
            },
            {
              "texte": "A peaceful path, walking side by side"
            }
          ],
          "activites": [
            {
              "texte": "A writing workshop, where people dare to read what they wrote"
            },
            {
              "texte": "A long walk without phones"
            },
            {
              "texte": "A listening circle, where everyone gets to finish their sentence"
            }
          ],
          "brilles": {
            "texte": "You shine one to one, when you can go deep without rushing or changing the subject."
          },
          "eviter": {
            "texte": "Big groups where things stay on the surface, and nobody listens to the end."
          },
          "talent": "When you do what you truly enjoy, you meet people who are like you. That's often where your Unique Talent hides: succeeding through enjoyment, in love too."
        }
      },
      "admiration": {
        "name": "Admiration",
        "key": "I need to feel the other person notices me and chooses me.",
        "noun": "Star",
        "adj": "Radiant",
        "lower": "admiration",
        "de": "admiration",
        "who": "someone who likes to be noticed, and knows how to pay compliments in return",
        "s1": "love warmly, and you light up when the other person is proud of you",
        "secNeed": "the other person to be proud of you",
        "bloomShort": "the other person is proud of you and tells you so",
        "fadeShort": "nobody notices your efforts and everything you do seems to go without saying",
        "bloom": "You blossom when you feel chosen, every day, and not just at the start. A word of pride, a sincere thank you, a compliment in front of your friends give you wings. It isn't vanity: it's proof that the other person truly sees you.",
        "bloomList": [
          "A partner who notices your efforts, and says so.",
          "Being supported in your projects, especially when you have doubts.",
          "Gestures that show you matter, not just habits."
        ],
        "secBloom": "you also need words of pride and recognition",
        "fade": "What hurts you is indifference. When everything you do becomes normal, when you're criticised more than thanked, you do more and more so you'll finally be noticed. Or you close up, hurt, without a word.",
        "fadeList": [
          "Constant criticism, especially in front of others.",
          "Your successes met with a distracted “oh, good”.",
          "Carrying the daily load alone, without a thank you."
        ],
        "alarm": "If you catch yourself doing more and more in the hope of a look that never comes, your need for admiration has run dry.",
        "secFade": "indifference ends up switching you off, even in a stable relationship",
        "rel": {
          "rythme": "A lively rhythm, with moments to shine: a dinner, an outing, a party.",
          "proximite": "Closeness that shows: gestures, words, pride on display, including in front of others.",
          "independance": "You like having your own projects, and the other person taking an interest. You need support, not an audience.",
          "conflits": "You need criticism to be about an action, never about you as a person. A hurtful remark in front of others stays with you for a long time."
        },
        "secCond": "words of pride and thanks, often",
        "partnerFond": "someone who knows how to say “well done” and “thank you”, and who is proud of you in front of others",
        "sayPartner": [
          "“It would do me good if you told me what you appreciate about me.”",
          "“When you notice what I've done, I want to do even more for us.”",
          "“I need you to be proud of me, and to tell me, even simply.”"
        ],
        "sayDate": [
          "“What touches me most is when people notice efforts, even small ones.”",
          "A question to ask: “What are you most proud of right now?”"
        ],
        "trigger": "you feel criticised, compared or forgotten",
        "calm": "to hear what's valuable about you, before hearing what's wrong",
        "rencontre": {
          "lieux": [
            {
              "texte": "A small stage, where people show what they've prepared"
            },
            {
              "texte": "An opening night or a workshop where everyone shows their work"
            },
            {
              "texte": "A class where progress is cheered, out loud"
            }
          ],
          "activites": [
            {
              "texte": "Preparing an exhibition, a text or a project that others can see"
            },
            {
              "texte": "Singing, acting or creating with a supportive troupe"
            },
            {
              "texte": "Encouraging others, and getting the same warmth back"
            }
          ],
          "brilles": {
            "texte": "You shine when people see you doing what you love, in front of a few people who know how to say thank you."
          },
          "eviter": {
            "texte": "Places where your efforts go unnoticed, without a word of recognition."
          },
          "talent": "When you do what you truly enjoy, you meet people who are like you. Your Unique Talent shows in that enjoyment: in love, it matters just as much."
        }
      },
      "liberte": {
        "name": "Freedom",
        "key": "I need room to breathe to love fully.",
        "noun": "Bird",
        "adj": "Free",
        "lower": "freedom",
        "de": "freedom",
        "who": "someone with a life of their own who gives you room to breathe",
        "s1": "love while staying yourself, with space to breathe",
        "secNeed": "to keep a life of your own",
        "bloomShort": "the other person trusts you and gives you room to breathe",
        "fadeShort": "you have to justify everything and the relationship hems you in",
        "bloom": "You blossom in a relationship where each of you keeps your own life: your friends, your projects, your time alone. The freer you feel, the more eagerly you come back to the other person. It isn't a lack of love, it's your way of loving without fading.",
        "bloomList": [
          "An evening alone or with friends, without guilt or an interrogation when you get back.",
          "A partner who has their own life and their own passions.",
          "Decisions made together, without control or having to account for yourself."
        ],
        "secBloom": "you also need moments just for you",
        "fade": "What switches you off is feeling watched or held back. “Where were you?”, jealousy, “we do everything together” make your throat tighten. First you drift away in your head, then you look for a way out, even if you love the other person.",
        "fadeList": [
          "Having to account for your schedule.",
          "Jealousy every time you go out with friends.",
          "A shared diary filled up without anyone asking your opinion."
        ],
        "alarm": "If you catch yourself dreaming of evenings alone as an escape, or lying about trivial things for some peace, your need for freedom is suffocating.",
        "secFade": "a relationship that hems you in ends up making you run away",
        "rel": {
          "rythme": "A flexible rhythm, with big moments together and time for yourself, without having to apologise for it.",
          "proximite": "Being close because you want to, not out of obligation: you come back to the other person because you enjoy it.",
          "independance": "Strong: your friends, your projects, your money, your time. You want a partner, not a shared timetable.",
          "conflits": "You need some distance before talking about it. Cornered in a discussion, you escape; with a little room to breathe, you come back with solutions."
        },
        "secCond": "time for yourself, without having to justify it",
        "partnerFond": "someone who has their own life, who trusts you and doesn't take your time alone as abandonment",
        "sayPartner": [
          "“When I take time for myself, it isn't against you. It's how I come back to you, eager to see you.”",
          "“I need you to trust me, without me having to explain everything.”",
          "“We can see each other a bit less, but better. What would you enjoy for our evenings together?”"
        ],
        "sayDate": [
          "“I love relationships where each person keeps their own life, and you meet up because you want to.”",
          "A question to ask: “What do you do when you have a whole day to yourself?”"
        ],
        "trigger": "you feel cornered, controlled or pressured to answer",
        "calm": "a little space, and the certainty that you'll talk about it again later",
        "rencontre": {
          "lieux": [
            {
              "texte": "A trail or an outdoor spot, where everyone arrives at their own pace"
            },
            {
              "texte": "An open workshop, with no fixed hours"
            },
            {
              "texte": "A small-group trip, with free time for yourself"
            }
          ],
          "activites": [
            {
              "texte": "An outing decided on the day, without a tight schedule"
            },
            {
              "texte": "A sport you do alone, then talk about if you feel like it"
            },
            {
              "texte": "A project of your own, that you show when you're ready"
            }
          ],
          "brilles": {
            "texte": "You shine in a flexible setting, where people meet up because they want to, not because they have to."
          },
          "eviter": {
            "texte": "Groups where you have to do everything together, and justify every hour of your diary."
          },
          "talent": "When you do what you truly enjoy, you meet people who are like you. Your Unique Talent breathes in that enjoyment: in love, it's the same drive."
        }
      },
      "harmonie": {
        "name": "Harmony",
        "key": "I need gentleness and peace between us.",
        "noun": "Oasis",
        "adj": "Peaceful",
        "lower": "harmony",
        "de": "harmony",
        "who": "someone gentle, who looks for peace and tenderness",
        "s1": "love gently, and you create a real cocoon around you",
        "secNeed": "a gentle daily life, without shouting or digs",
        "bloomShort": "daily life is gentle and disagreements are voiced without shouting",
        "fadeShort": "digs and tension become normal",
        "bloom": "You blossom in a tender, peaceful relationship. Small everyday gestures, a hand on your back, a quiet evening, do you a world of good. In that atmosphere, you offer a gentleness and kindness that do everyone good.",
        "bloomList": [
          "Calm evenings together, with no tension in the air.",
          "Everyday tenderness: a hug in passing, a sweet word.",
          "Disagreements voiced calmly, then a real making up."
        ],
        "secBloom": "you also need calm and tenderness every day",
        "fade": "What wears you out is raised voices, irony and tension that lingers. To avoid conflict, you smooth things over, keep quiet, adapt. The unsaid piles up, until the day you leave without the other person seeing it coming.",
        "fadeList": [
          "Shouting, digs, irony that hurts.",
          "A tense atmosphere that lasts for days.",
          "Always having to give in for peace to return."
        ],
        "alarm": "If you catch yourself keeping quiet to avoid an argument, again and again, your need for harmony is stopping you from saying what you think.",
        "secFade": "tension that lingers ends up wearing you out",
        "rel": {
          "rythme": "A gentle, predictable rhythm, with calm evenings and tender moments.",
          "proximite": "Tender closeness: gestures, gentleness, a soothing presence.",
          "independance": "Medium: you like sharing lots of things, without being glued to the other person, as long as the atmosphere stays peaceful.",
          "conflits": "You need disagreements without shouting or digs. Talking calmly, at the right time, then truly making up."
        },
        "secCond": "disagreements without shouting or digs",
        "partnerFond": "someone calm and gentle, who knows how to argue without hurting, then make up",
        "sayPartner": [
          "“I need us to be able to disagree without raising our voices.”",
          "“A hug when I get home changes my whole evening.”",
          "“I don't always say when something bothers me. If you feel me drifting away, ask me gently.”"
        ],
        "sayDate": [
          "“What I love most is when we simply feel good together.”",
          "A question to ask: “What do you do when you disagree with someone you love?”"
        ],
        "trigger": "voices rise, or when you sense a tension nobody names",
        "calm": "a calm voice and a gentle gesture, before any discussion",
        "rencontre": {
          "lieux": [
            {
              "texte": "A community garden, in peace and quiet"
            },
            {
              "texte": "A yoga or gentle meditation class"
            },
            {
              "texte": "A quiet tea room, in a small group"
            }
          ],
          "activites": [
            {
              "texte": "Cooking without rushing, with unhurried gestures"
            },
            {
              "texte": "A slow walk, with no need to go fast"
            },
            {
              "texte": "Pottery, drawing or sewing, in a friendly silence"
            }
          ],
          "brilles": {
            "texte": "You shine in a gentle atmosphere, as a pair or in a very small group, where people talk without raising their voices."
          },
          "eviter": {
            "texte": "Noisy parties, and debates where people talk over each other."
          },
          "talent": "When you do what you truly enjoy, you meet people who are like you. Your Unique Talent feels at home there: succeeding through enjoyment, in love too."
        }
      },
      "complicite": {
        "name": "Closeness",
        "key": "I need to laugh and be a team with you.",
        "noun": "Team",
        "adj": "Playful",
        "lower": "closeness",
        "de": "closeness",
        "who": "someone who loves to laugh, be a team and share daily life",
        "s1": "love as a team, with laughter and shared projects",
        "secNeed": "to laugh and be a team every day",
        "bloomShort": "you laugh together and move forward as a team",
        "fadeShort": "everything gets heavy and you carry daily life alone",
        "bloom": "You blossom when the relationship is a joyful team. Jokes nobody else gets, little projects, chores shared without keeping score: for you, that's love. In a light relationship where you stick together, you're a partner full of energy and good humour.",
        "bloomList": [
          "Fits of laughter and jokes nobody else gets.",
          "Chores shared without having to negotiate.",
          "Little projects together: a recipe, a weekend, a piece of furniture to build."
        ],
        "secBloom": "you also need to laugh and do things together",
        "fade": "What drags you down is when everything gets heavy. Constant reproaches, seriousness from morning to night, the daily load resting on you all drain you. You lose your joy, become irritable, and end up looking for lightness elsewhere.",
        "fadeList": [
          "Handling the shopping, appointments and organising alone.",
          "A partner who no longer laughs at your jokes.",
          "Sulking that drags on, instead of sorting things out and moving on."
        ],
        "alarm": "If you catch yourself preferring to laugh with your friends rather than with your partner, your need for closeness has broken down.",
        "secFade": "a daily life without laughter or teamwork ends up draining you",
        "rel": {
          "rythme": "A lively rhythm: laughter, outings, ideas, little projects together.",
          "proximite": "Being close like teammates: doing things together, sharing chores, telling each other the little things.",
          "independance": "You like doing lots together, but not everything. Each of you can have your own friends, as long as you stay a team.",
          "conflits": "You need to sort things out fast and move on. Sulking that drags on weighs on you more than the argument itself."
        },
        "secCond": "laughter and things done together",
        "partnerFond": "someone who loves to laugh, who does their part without keeping score and sees themselves as your teammate",
        "sayPartner": [
          "“We make a great team when we laugh together. Shall we set aside a moment for that this week?”",
          "“I'd like us to split the chores differently, so it stops being a source of tension.”",
          "“Remember our last fit of laughter? I want more of those.”"
        ],
        "sayDate": [
          "“For me, a couple is first of all a team that laughs together.”",
          "A question to ask: “What's the best laughing fit you've ever had?”"
        ],
        "trigger": "you feel alone facing problems, or when the good mood disappears",
        "calm": "a team gesture: “let's look at this together”",
        "rencontre": {
          "lieux": [
            {
              "texte": "A shared kitchen, to cook a meal with others"
            },
            {
              "texte": "A games club, where people laugh around the table"
            },
            {
              "texte": "A community building project or a hands-on charity project"
            }
          ],
          "activites": [
            {
              "texte": "Building something with others: a recipe, a piece of furniture, a weekend"
            },
            {
              "texte": "A relaxed team sport, with no pressure to win"
            },
            {
              "texte": "A game that often ends in fits of laughter"
            }
          ],
          "brilles": {
            "texte": "You shine in a shared project, when people laugh while doing things together."
          },
          "eviter": {
            "texte": "Overly serious atmospheres, where everyone stays in their corner without offering a hand."
          },
          "talent": "When you do what you truly enjoy, you meet people who are like you. Your Unique Talent loves that shared enjoyment: in love, it's the same."
        }
      },
      "intensite": {
        "name": "Intensity",
        "key": "I need our story to spark.",
        "noun": "Volcano",
        "adj": "Passionate",
        "lower": "intensity",
        "de": "intensity",
        "who": "someone who loves momentum, passion and new things",
        "s1": "love passionately, looking for what makes you come alive",
        "secNeed": "things to keep sparking, long after the start",
        "bloomShort": "the relationship keeps its desire, its momentum and its sense of novelty",
        "fadeShort": "routine sets in and desire falls asleep",
        "bloom": "You blossom in a living relationship, where you desire each other, surprise each other, dare. Adventure together makes you come alive: an improvised trip, a slightly crazy project, an evening like no other. When it sparks, you give incredible energy and generosity.",
        "bloomList": [
          "Feeling desired, long after the start.",
          "Surprises, discoveries, spur-of-the-moment weekends.",
          "A partner who dares, who suggests things, who shakes you up a little."
        ],
        "secBloom": "you also need momentum, surprise and desire",
        "fade": "Your enemy is routine with no surprises. The same evenings, the same conversations, a desire that falls asleep: you slowly fade. The risk is looking for the spark elsewhere, or creating drama to feel that things are still alive.",
        "fadeList": [
          "The same evenings, again and again.",
          "A partner who never suggests anything new.",
          "A desire that falls asleep without anyone talking about it."
        ],
        "alarm": "If you catch yourself picking a fight to feel something, or dreaming of another life, your need for intensity is no longer being fed.",
        "secFade": "routine ends up putting out your flame",
        "rel": {
          "rythme": "A changing rhythm: new things, surprises, projects that make you come alive.",
          "proximite": "Strong closeness, physical and emotional. You need to feel desired, long after the start.",
          "independance": "You need to live your own adventures, then share them with passion.",
          "conflits": "You flare up fast and forgive fast. You need a partner who doesn't run from intensity, without escalating."
        },
        "secCond": "new things and desire, regularly",
        "partnerFond": "someone who dares, who suggests things, who keeps desire alive and isn't afraid of intensity",
        "sayPartner": [
          "“I want us to keep surprising each other. Shall we plan an evening like no other?”",
          "“Feeling desired is what makes me feel loved.”",
          "“When we dare new things together, I fall in love with you all over again.”"
        ],
        "sayDate": [
          "“What makes me come alive is discovering, daring, never being bored.”",
          "A question to ask: “What's the craziest thing you've ever done on a whim?”"
        ],
        "trigger": "you feel the other person drifting away, or when the relationship turns lukewarm",
        "calm": "real contact, a look, a held hand, rather than a long speech",
        "rencontre": {
          "lieux": [
            {
              "texte": "A dance class, where people dare to move"
            },
            {
              "texte": "A slightly improvised hike or trip"
            },
            {
              "texte": "A concert in a small venue, where the energy flows"
            }
          ],
          "activites": [
            {
              "texte": "Trying a new activity, for the joy of discovering"
            },
            {
              "texte": "Climbing, the stage or a sport that really wakes you up"
            },
            {
              "texte": "Preparing a group surprise, a little crazy and generous"
            }
          ],
          "brilles": {
            "texte": "You shine when something lively is happening, in a slightly crazy project carried with others."
          },
          "eviter": {
            "texte": "Groups that always do the same thing, with no surprise and no momentum."
          },
          "talent": "When you do what you truly enjoy, you meet people who are like you. Your Unique Talent lights up through enjoyment: in love, that's true too."
        }
      }
    },
    "encyclo": {
      "regle": "The 7 families are the 7 needs of the profile: Security, Depth, Admiration, Freedom, Harmony, Closeness, Intensity. A pair links 2 families, including a family with itself: 21 mixed pairs and 7 mirror pairs, so 28. The grouping reuses the type already set in profil.couples, without changing the score. nourrit: the 2 needs feed each other. proche: they're alike, with 1 point to keep alive. miroir: the same need on both sides, a lovely resonance and a blind spot. These 3 types go under “Who it flows easily with”. frotte: the needs pull in 2 directions. This type goes under “What needs attention”. Each pair has a tip: what to watch, and how to keep the bond strong. A meeting is never condemned.",
      "openAll": "Discover all the profiles",
      "close": "Close",
      "nourritLab": "What feeds you",
      "videLab": "What drains you",
      "nuancesLab": "The 6 shades of this profile",
      "couleLab": "Who it flows easily with",
      "attentionLab": "What needs attention",
      "tipLab": "The gesture that helps",
      "sameLab": "Same family",
      "cards": {
        "securite": {
          "portrait": "You need to know who you can count on. When that's clear, you relax, and that's when you become truly tender. Habits don't trap you. For you, they prove the other person is there.",
          "nourrit": "Promises kept, little rituals that come back, talking about the future together.",
          "vide": "Not knowing where you stand, promises that stay promises, someone whose mood changes without a word.",
          "nuances": {
            "profondeur": "Deep: you want something solid and real. You commit when you truly know the person and can count on them.",
            "admiration": "Radiant: people can trust you, and you need everything you do for the relationship to be noticed.",
            "liberte": "Free: you want a home to come back to, and time for yourself. A stable life suits you very well, if each person keeps their friends and activities.",
            "harmonie": "Peaceful: you dream of a gentle, safe home. Calm does you good. Be careful though: silence doesn't always mean yes.",
            "complicite": "Playful: you want to be able to count on the other person, and laugh with them. Projects move forward better when you don't take yourselves too seriously.",
            "intensite": "Passionate: you want passion and stability. Strong feelings between you, yes, but without wondering every morning whether the other person will stay."
          }
        },
        "profondeur": {
          "portrait": "You love it when you can tell each other everything. A real conversation moves you more than a fancy restaurant. When you feel understood, your loyalty and your listening are rare.",
          "nourrit": "Being listened to until the end, being able to talk about what scares you, feeling that the other person truly tries to understand you.",
          "vide": "Empty conversations, topics that get avoided, feeling alone even though there are 2 of you.",
          "nuances": {
            "securite": "Loyal: you want something real, and lasting. You open up more easily to someone who keeps their word.",
            "admiration": "Radiant: you want to be truly seen, not just complimented. What moves you is being admired for who you are deep down.",
            "liberte": "Free: you need moments alone with your thoughts. When you can withdraw without having to justify it, you come back to the other person gladly.",
            "harmonie": "Peaceful: you love speaking honestly, but without shouting. When the other person stays gentle, you can tell them everything.",
            "complicite": "Playful: with the same person, you can talk about serious things and end up in fits of laughter. Humour suits you, as long as it isn't used to avoid what hurts.",
            "intensite": "Passionate: you love strongly, and for real. You're looking for a relationship that leaves its mark, with some calm moments too."
          }
        },
        "admiration": {
          "portrait": "You blossom when the other person chooses you, and not just at the start. A real thank you, an “I'm proud of you”, and you feel like you're growing wings. It isn't vanity, it's your way of feeling that the other person sees you.",
          "nourrit": "Having your efforts noticed, hearing “well done”, someone being proud of you, even in front of others.",
          "vide": "Indifference, repeated reproaches, the feeling that nobody notices what you do any more.",
          "nuances": {
            "securite": "Loyal: you do a lot to make your relationship last, and you need it to be noticed.",
            "profondeur": "Deep: easy compliments aren't enough for you. You want to be admired for who you are, even for what you rarely show.",
            "liberte": "Free: you want to shine without being held back. It does you good when someone is proud of you, as long as they let you lead your own life.",
            "harmonie": "Peaceful: you're kind to everyone, and you need that kindness returned with sweet words.",
            "complicite": "Playful: you want someone who cheers you on and laughs with you. Wherever you go, the atmosphere warms up.",
            "intensite": "Passionate: you love big. Feeling desired and chosen, and for it to show, is what makes you come alive."
          }
        },
        "liberte": {
          "portrait": "You love without giving up your life. Seeing your friends, having your projects, spending time alone doesn't mean you love any less. Quite the opposite: the freer you feel, the more you want to come back.",
          "nourrit": "Trust, time for yourself, someone who also has a life of their own.",
          "vide": "Having to justify yourself, jealousy, a shared diary filled without anyone asking your opinion.",
          "nuances": {
            "securite": "Loyal: you want your freedom and a place to come back to. It works better when important dates are kept.",
            "profondeur": "Deep: you need moments alone to think, then you come back with real things to share.",
            "admiration": "Radiant: you want people to be proud of your path, without trying to keep you to themselves.",
            "harmonie": "Peaceful: you love a simple relationship, without pressure and without shouting. For you, being at peace also means being able to leave and come back.",
            "complicite": "Playful: you want a partner in crime. Laughing, leaving, meeting up again: that's your way of loving.",
            "intensite": "Passionate: you love adventure and acting on a whim. For you, love is a journey, not a waiting room."
          }
        },
        "harmonie": {
          "portrait": "You blossom in gentleness. A tender gesture, a quiet evening, and you recharge your batteries. When the atmosphere is gentle, your kindness does everyone good. Your challenge is daring to say when something bothers you.",
          "nourrit": "Calm, the little tender gestures of daily life, being able to disagree without hurting each other.",
          "vide": "Shouting, digs, tension that lingers, always having to give in for some peace.",
          "nuances": {
            "securite": "Loyal: you dream of a gentle, safe home. A regular life reassures you, if you can also talk about touchy subjects.",
            "profondeur": "Deep: you say true things gently. You listen a lot, and you need to be listened to as well when something hurts you.",
            "admiration": "Radiant: sweet words do you good. You're kind, and you need it to be noticed.",
            "liberte": "Free: you want peace, not a prison. Each person has their own life, and you're glad to meet up again.",
            "complicite": "Playful: you love a joyful, peaceful life. Laughter, yes, but without the obligation to always be in a good mood.",
            "intensite": "Passionate: you want tenderness and a little spice. Intensity appeals to you when it comes through desire, not arguments."
          }
        },
        "complicite": {
          "portrait": "For you, loving means being a team. Jokes nobody else gets, chores done together, little projects. In a light relationship where you stick together, you're in your element.",
          "nourrit": "Fits of laughter, helping each other without keeping score, moving forward together on concrete things.",
          "vide": "Heavy atmospheres, carrying everything alone day to day, the good mood slipping away.",
          "nuances": {
            "securite": "Loyal: you want a team that lasts. For you, shared habits and fits of laughter go together.",
            "profondeur": "Deep: with the same person, you can laugh about everything and tell them everything. You joke, and you also talk about what matters.",
            "admiration": "Radiant: you want a partner who sees you and cheers you on. You give a lot of warmth, and you need some back.",
            "liberte": "Free: you want a partner in crime, not someone who holds you back. You laugh, you each go your own way, you meet up again.",
            "harmonie": "Peaceful: you love good humour without the shouting. A calm team, where tension is sorted out quickly.",
            "intensite": "Passionate: you want a story where things happen. Laughing, daring, surprising each other, without forgetting the simple moments."
          }
        },
        "intensite": {
          "portrait": "You blossom when things are moving between you. Desire, surprises, a slightly crazy project. When it's alive, you have incredible energy. Routine without desire, on the other hand, slowly switches you off.",
          "nourrit": "Feeling desired, discovering new things, someone who dares and has ideas.",
          "vide": "Evenings that are all the same, a desire that falls asleep, never any surprises.",
          "nuances": {
            "securite": "Loyal: you want passion and stability. An adventure can be planned a little, and a stable life can still surprise you.",
            "profondeur": "Deep: you're looking for a rare encounter. Conversations that leave their mark make you come alive, and you need calm too.",
            "admiration": "Radiant: you want to feel chosen and desired, and for it to show. You love grand gestures, and the little everyday attentions too.",
            "liberte": "Free: you love living adventures together, each free to follow your own wishes. Nobody holds anybody back.",
            "harmonie": "Peaceful: you want life, not war. Passion comes through desire and novelty, not through shouting.",
            "complicite": "Playful: you want to laugh and dare. No room for boredom, but serious conversations have their moment too."
          }
        }
      },
      "paires": {
        "securite+securite": {
          "text": "2 Anchors quickly build a solid home. Each knows who they can count on, and that's restful.",
          "tip": "Every now and then, plan something new, so habit doesn't replace desire."
        },
        "profondeur+profondeur": {
          "text": "2 Mirrors can tell each other everything. Intimacy like that is rare.",
          "tip": "Keep some light moments too. A conversation doesn't need to be deep to be sincere."
        },
        "admiration+admiration": {
          "text": "2 Stars know how to lift each other up and do each other good with words.",
          "tip": "Let the other person shine as often as yourself. Take turns being in the spotlight."
        },
        "liberte+liberte": {
          "text": "2 Birds respect each other without keeping watch. Each has their own life, and you're together because you want to be.",
          "tip": "Set a few important dates. Otherwise, with so much freedom, you end up drifting apart."
        },
        "harmonie+harmonie": {
          "text": "2 Oases make for a rare gentleness. Daily life is calm, tender, easy to live.",
          "tip": "Say what bothers you, even if it's a detail. You're better together when you don't keep everything to yourselves."
        },
        "complicite+complicite": {
          "text": "2 Teams laugh, help each other and move forward. Life together has rhythm and joy.",
          "tip": "Keep a moment for serious topics. You can't sort everything out with a joke."
        },
        "intensite+intensite": {
          "text": "2 Volcanoes attract each other and wake each other up. The passion is there, strong and alive.",
          "tip": "When things flare up, set a few simple rules, for example never going to bed angry. Passion lasts better that way."
        },
        "securite+profondeur": {
          "text": "The Anchor is reliable, the Mirror speaks honestly. Together, you can trust each other and say everything.",
          "tip": "Give yourselves time. You don't need all the answers right away to be sincere."
        },
        "securite+admiration": {
          "text": "The Anchor is there every day, the Star has the words that warm the heart. Each feels supported and appreciated.",
          "tip": "Say thank you often, out loud. What the other person does every day shows better when it's said."
        },
        "securite+liberte": {
          "text": "The Anchor needs to know who it can count on, the Bird needs freedom. At first, it balances out. Over time, one may feel neglected, the other smothered.",
          "tip": "Decide early how often you keep in touch and see each other. Each keeps their freedom, and nobody is left in the dark."
        },
        "securite+harmonie": {
          "text": "The Anchor and the Oasis love calm and stories that last. Life together is simple, gentle, with no nasty surprises.",
          "tip": "Every now and then, bring up a delicate topic. Feeling good together doesn't mean keeping quiet."
        },
        "securite+complicite": {
          "text": "The Anchor holds the course, the Team brings the good mood. Projects move forward, and you have a laugh along the way.",
          "tip": "When organising takes up all the space, keep a moment to laugh. It matters as much as the shopping list."
        },
        "securite+intensite": {
          "text": "The Volcano wants things to move, the Anchor wants them to last. One may find the other too calm, the other too unpredictable.",
          "tip": "Plan your adventures a little, and slip surprises into daily life. That way, everyone gets what they need."
        },
        "profondeur+admiration": {
          "text": "The Star loves to shine, the Mirror wants to get to the heart of things. One may find the other too serious, the other too superficial.",
          "tip": "Tell each other what you truly admire in one another, not just what shows from afar. Both of you will find yourselves in it."
        },
        "profondeur+liberte": {
          "text": "The Mirror and the Bird both need time to themselves. They understand each other without having to justify themselves.",
          "tip": "Say when you need to be alone, and keep real moments together. Stepping back isn't rejecting the other person."
        },
        "profondeur+harmonie": {
          "text": "The Oasis brings gentleness, the Mirror brings listening. You can say things to each other without fear.",
          "tip": "Dare to say what hurts too, with the same gentleness. The other person can't guess everything."
        },
        "profondeur+complicite": {
          "text": "The Mirror wants to get to the heart of things, the Team would rather laugh about it. At first, it's charming. Then one may feel the other is running away, and the other may feel crushed.",
          "tip": "Keep the moments separate. A time to laugh, a time to talk, without mixing everything up."
        },
        "profondeur+intensite": {
          "text": "The Mirror and the Volcano are looking for a strong relationship. Their conversations leave their mark, and the attraction is there.",
          "tip": "Keep a few reassuring habits. You don't need a rollercoaster for it to be strong."
        },
        "admiration+liberte": {
          "text": "The Bird lives its own life, the Star needs to be seen. One may feel watched, the other forgotten.",
          "tip": "Plan moments just for the 2 of you, and stick to them. The Bird keeps its freedom, and the Star knows it matters."
        },
        "admiration+harmonie": {
          "text": "The Oasis and the Star know how to do each other good. Kindness, sweet words, a tender atmosphere.",
          "tip": "Dare to disagree from time to time. Doing each other good doesn't always mean saying yes."
        },
        "admiration+complicite": {
          "text": "The Star and the Team bring out the best in each other. You encourage each other, laugh, go out a lot. It sparkles.",
          "tip": "When the week is quiet, a simple thank you is enough. Not every evening needs to be a party."
        },
        "admiration+intensite": {
          "text": "The Star and the Volcano desire and admire each other. Each feels chosen, and it's never flat.",
          "tip": "Remember that being there every day is also proof of love, even if it gets noticed less."
        },
        "liberte+harmonie": {
          "text": "The Bird needs freedom, the Oasis needs calm. Each lets the other live their own way, without tension.",
          "tip": "When the other person comes home, a tender gesture beats an interrogation. Reunions stay light."
        },
        "liberte+complicite": {
          "text": "The Bird and the Team love lightness. You feel good together, with no pressure, and you laugh a lot.",
          "tip": "Still take on a project together. It takes nothing away from anyone's freedom, quite the opposite."
        },
        "liberte+intensite": {
          "text": "The Bird and the Volcano love adventure, and each leaves room for the other. Nobody holds anybody back.",
          "tip": "Stay when the excitement of the early days fades too. That's often where the story really begins."
        },
        "harmonie+complicite": {
          "text": "The Team loves things lively, the Oasis prefers peace and quiet. Outings and invitations can quickly become an issue.",
          "tip": "Each keeps their outings or their quiet evenings, without making the other feel guilty. There's room for both rhythms."
        },
        "harmonie+intensite": {
          "text": "The Oasis looks for peace, the Volcano needs sparks. What wakes one up can tire the other out.",
          "tip": "Put passion into desire and new things, never into arguments. Passion can be gentle too."
        },
        "complicite+intensite": {
          "text": "The Team and the Volcano want a story where things happen. Ideas, fits of laughter, the urge to dare.",
          "tip": "Also keep time to catch your breath and to talk seriously. You don't need to make noise to be happy together."
        }
      }
    },
    "ui": {
      "eyebrowNamed": "{prenom}, your love profile (working hypothesis) · 1 combination out of 42",
      "eyebrowAnon": "Your love profile (working hypothesis) · 1 combination out of 42",
      "domSec": "Dominant {domName} ({domKey}) · Secondary {secName} ({secKey})",
      "alliageLab": "Your blend",
      "pillDom": "Dominant",
      "pillSec": "Secondary",
      "sentences": {
        "s1Anon": "Your love profile is {profil}: you {s1}, and you need {secNeed}.",
        "s1": "{prenom}, your love profile is {profil}: you {s1}, and you need {secNeed}.",
        "s2": "You blossom when {bloomShort}, and you fade when {fadeShort}.",
        "s3": "Under heavy stress, your trap is {trapName}: {trapShort}. To get out of it, {exitShort}."
      },
      "barsLab": "Your 7 love needs",
      "netLine": "Your dominant need stands out very clearly.",
      "mixedLine": "Your top 2 needs weigh almost the same: you may also recognise yourself in the {inverse} profile.",
      "whyLab": "Why this profile?",
      "whyIntro": "What weighed most towards {domName}:",
      "whyNote": "Each answer gives points to 1 or 2 needs. Your profile brings together the 2 needs with the most points. It's a hypothesis: check it against what you've really lived.",
      "toc": [
        "Blossoming",
        "Fading",
        "Your relationship",
        "Your partner",
        "Words to say",
        "Under stress",
        "What now?"
      ],
      "s1h": "Where you blossom in love",
      "s1top": "What you ranked first, “{short}”, says a lot about your need for {de}.",
      "s1recharge": "Energy-wise, {title}: {couple}",
      "s2h": "Where you fade",
      "s2ownH": "What you don't want to live through again",
      "s2alarmLab": "Warning sign",
      "s2noMore": "Your pet hate, “{short}”, goes straight to your need for {de}.",
      "s2noMoreOwn": "Your pet hate, “{short}”, is what you don't want to live through again. Keep it in mind: it's precious for choosing well.",
      "s2test": "The 10-year test: if a partner put you through this, could you bear it for 10 years, and even a little worse? If the answer is no, listen to it, even if you're in love.",
      "s3h": "The kind of relationship that suits you",
      "s3rows": {
        "rythme": "Rhythm",
        "proximite": "Closeness",
        "independance": "Independence",
        "conflits": "Conflict"
      },
      "s3sec": "Your secondary need ({name}) adds a condition: {cond}.",
      "s3instinct": "Your subtype ({name}): {couple}",
      "s4h": "The compatible partner",
      "s4rule": "The rule: alike at heart, different in form. The same needs and the same values, but each with your own way of living them.",
      "s4fond": "Deep down, you need {fond}.",
      "s4fondSec": "And for your secondary need: {fond}.",
      "s4lang": "For you to feel loved: someone who {hint}.",
      "s4stress": "When things heat up: {partner}",
      "s4nourrit": "What feeds it",
      "s4proche": "Close to you (easy, to keep nurturing)",
      "s4frotte": "Where it may get stuck (raise it early)",
      "s4critical": "Incompatible (non-negotiable)",
      "s4profileLine": "A {name} profile ({who})",
      "s4mirrorLab": "With someone like you",
      "s5h": "Sentences to say",
      "s5partner": "To your partner",
      "s5date": "On a first date",
      "s6h": "Your classic trap under stress, and how to get out of it",
      "s6trigger": "For you, it's mostly triggered when {trigger}.",
      "s6early": "Before it gets that far, under moderate stress, you {modere}: that's the first sign. That's when to act.",
      "s6calm": "What you really need at that moment: {calm}.",
      "s6exitLab": "Getting out of it, in 3 steps",
      "s6also": "You also ticked: {others}.",
      "why": {
        "nourrit": "“{short}”, ranked #{rank} in what feeds you",
        "vide": "“{short}”, in what drains you",
        "ressource": "your recharge “{short}”",
        "langages": "{lower}, your #{rank} love language",
        "ennea": "your Enneagram lead (a hypothesis, not a verdict)",
        "valeurs": "{short}, your #{rank} value",
        "instinct": "your {name} subtype",
        "stress": "the way you react under stress"
      }
    }
  },
  "ennea": {
    "types": {
      "t1": {
        "name": "the Perfectionist",
        "couple": "In a relationship, you bring reliability and seriousness, and you need a partner who respects your efforts without feeling constantly corrected.",
        "piege": "wanting to correct the other person instead of accepting them as they are"
      },
      "t2": {
        "name": "the Altruist",
        "couple": "In a relationship, you bring warmth and attention, and you need a partner who takes care of you too, without you having to ask.",
        "piege": "forgetting yourself to make yourself indispensable"
      },
      "t3": {
        "name": "the Achiever",
        "couple": "In a relationship, you bring drive and projects, and you need a partner who loves you for who you are, not for what you achieve.",
        "piege": "putting your image or your work before your relationship"
      },
      "t4": {
        "name": "the Romantic",
        "couple": "In a relationship, you bring depth and truth, and you need a partner who welcomes your emotions without being scared by them.",
        "piege": "idealising what's missing and no longer seeing what's there"
      },
      "t5": {
        "name": "the Observer",
        "couple": "In a relationship, you bring calm, loyalty and a fair eye, and you need a partner who respects your need to be alone at times.",
        "piege": "withdrawing instead of sharing what you feel"
      },
      "t6": {
        "name": "the Loyalist",
        "couple": "In a relationship, you bring commitment and faithfulness, and you need a steady partner who reassures you through their actions.",
        "piege": "testing the other person or doubting them even when all is well"
      },
      "t7": {
        "name": "the Epicure",
        "couple": "In a relationship, you bring joy and adventure, and you need a curious partner who doesn't see your need for freedom as a threat.",
        "piege": "running from discomfort instead of getting through the hard times"
      },
      "t8": {
        "name": "the Protector",
        "couple": "In a relationship, you bring strength and protection, and you need a solid partner who dares to stand up to you, gently.",
        "piege": "taking up too much space, and believing that speaking loudly means being right"
      },
      "t9": {
        "name": "the Mediator",
        "couple": "In a relationship, you bring gentleness and calm, and you need a partner who's truly interested in what you want.",
        "piege": "fading into the background to avoid conflict"
      }
    },
    "disclaimer": "The Enneagram is a starting hypothesis, not a label. 3 screens aren't enough to find your type for sure: take this result as a lead to explore, ideally with someone who knows the Enneagram well.",
    "credit": "The Enneagram describes 9 core motivations and 3 instincts (self-preservation, social, one-to-one).",
    "stressHint": "Your reaction under heavy stress points the same way as your lead.",
    "confidenceOne": "This is your main lead, to be confirmed over time.",
    "confidenceMany": "You're torn between {typeLabel} and {altLabel}: keep both leads open."
  },
  "instincts": {
    "sp": {
      "name": "self-preservation",
      "desc": "You think first about comfort, material security and everyday well-being.",
      "couple": "In a relationship, you build a nest: a home, habits, concrete security."
    },
    "so": {
      "name": "social",
      "desc": "You think first about the group: being part of a circle, finding your place among others.",
      "couple": "In a relationship, you need your story to be part of a bigger life, with friends, family and people around you."
    },
    "sx": {
      "name": "one-to-one",
      "desc": "You look first for a strong bond with 1 person: attraction, the spark.",
      "couple": "In a relationship, you look for attraction, closeness and intense exchanges, just the 2 of you."
    }
  },
  "instinctPairs": {
    "sp-sp": "2 “self-preservation” partners: a stable, reassuring home. The risk: routine and comfort replacing desire. Plan new things together.",
    "so-so": "2 “social” partners: a life rich in friends and shared projects. The risk: no longer having time just for the 2 of you. Protect intimate moments.",
    "sx-sx": "2 “one-to-one” partners: an intense, almost magnetic bond. The risk: rollercoasters and jealousy. Keep some steady landmarks.",
    "sp-so": "Self-preservation and social: one dreams of a cocoon, the other of the wide world. Lived well, it's a lovely balance between home and openness. Lived badly, one feels alone at home and the other feels shut in.",
    "sp-sx": "Self-preservation and one-to-one: one seeks security, the other intensity. Together, you can combine stability and passion, as long as neither sees the other as “too calm” or “too intense”.",
    "so-sx": "Social and one-to-one: one blossoms in a group, the other wants exclusivity. The touchy subject is often evenings with friends. A simple agreement helps, for example a night out with others, then an evening just for the 2 of you."
  },
  "values": {
    "honnetete": {
      "short": "honesty",
      "opposite": "A partner who lies or hides important things."
    },
    "fidelite": {
      "short": "faithfulness",
      "opposite": "A partner who doesn't want exclusivity."
    },
    "respect": {
      "short": "respect",
      "opposite": "A contemptuous partner, even “as a joke”."
    },
    "famille": {
      "short": "family",
      "opposite": "A partner who keeps loved ones at a distance."
    },
    "enfants": {
      "short": "wanting children",
      "opposite": "A partner who doesn't want children."
    },
    "sans_enfants": {
      "short": "a life without children",
      "opposite": "A partner who absolutely wants children."
    },
    "liberte": {
      "short": "freedom",
      "opposite": "A partner who wants to share everything, all the time."
    },
    "ambition": {
      "short": "ambition",
      "opposite": "A partner who holds your projects back."
    },
    "simplicite": {
      "short": "simplicity",
      "opposite": "A partner who's always chasing more."
    },
    "aventure": {
      "short": "adventure",
      "opposite": "A partner who refuses to budge."
    },
    "humour": {
      "short": "humour",
      "opposite": "A partner who takes everything seriously."
    },
    "culture": {
      "short": "culture and curiosity",
      "opposite": "A partner who has no wish to discover anything."
    },
    "sante": {
      "short": "health and sport",
      "opposite": "A partner who completely neglects themselves."
    },
    "solidarite": {
      "short": "solidarity",
      "opposite": "A partner who doesn't care about others."
    },
    "creativite": {
      "short": "creativity",
      "opposite": "A partner who finds your creativity pointless."
    }
  },
  "stress": {
    "modere": {
      "D": {
        "short": "take charge",
        "text": "Under pressure, you take action and decide. It's a strength, as long as the other person has time to keep up.",
        "partner": "A partner who dares to tell you “wait” without backing down."
      },
      "I": {
        "short": "lighten the mood",
        "text": "You ease the atmosphere by talking and joking. Be careful not to miss what matters.",
        "partner": "A partner who laughs with you, then gently comes back to the topic."
      },
      "S": {
        "short": "lie low",
        "text": "You protect the peace and wait for the storm to pass. The risk: letting problems pile up.",
        "partner": "A patient partner who invites you to talk without rushing you."
      },
      "C": {
        "short": "analyse",
        "text": "You look for facts and logic. The risk: being right, but missing the other person's emotion.",
        "partner": "A partner who hears your arguments, and to whom you leave room for their emotions."
      }
    },
    "fort": {
      "fight": {
        "short": "hit back",
        "text": "Under heavy stress, you switch to fight mode: voices rise and you want the last word.",
        "tip": "Say “I'm taking a 20-minute break and I'll be back”, then really come back."
      },
      "flight": {
        "short": "run away",
        "text": "Under heavy stress, you escape: you go out, keep busy, avoid the subject.",
        "tip": "Set a specific time to talk about it again, so your break doesn't turn into running away."
      },
      "freeze": {
        "short": "freeze",
        "text": "Under heavy stress, you freeze: no more words, no more ideas. It isn't indifference.",
        "tip": "Prepare a simple sentence: “I'm stuck, give me a moment, I'll come back to you.”"
      },
      "fawn": {
        "short": "give in to keep the peace",
        "text": "Under heavy stress, you give in so it stops, even when you don't agree.",
        "tip": "Replace the automatic “yes” with: “I'm not sure, I'll think about it and let you know.”"
      }
    }
  },
  "brakes": {
    "rejet": {
      "short": "the fear of being rejected",
      "antidote": "Start small: a simple request, a simple answer. A no to a request isn't a no to you."
    },
    "blesser": {
      "short": "the fear of hurting the other",
      "antidote": "Gently saying what you feel isn't hurting. Staying quiet does more harm in the long run."
    },
    "moment": {
      "short": "waiting for the right moment",
      "antidote": "Choose a day this week, and write it down now. The right moment is the one you decide."
    },
    "espoir": {
      "short": "hoping the other will change",
      "antidote": "Look at what the other person does today, not what they might become. Trust actions."
    },
    "habitude": {
      "short": "the comfort of habit",
      "antidote": "Write down what this situation really costs you, in energy and joy. Comfort has a price."
    },
    "seul": {
      "short": "the fear of being alone",
      "antidote": "Make a list of what feeds you outside the relationship. The longer it is, the more freely you choose."
    },
    "flou": {
      "short": "not knowing what you want",
      "antidote": "Reread your 3 non-negotiables: when you're in doubt, they guide you."
    },
    "regard": {
      "short": "what others think",
      "antidote": "You're the one living your relationship, every day. Ask yourself: “What would I choose if nobody knew?”"
    },
    "contraintes": {
      "short": "practical constraints",
      "antidote": "First you decide, then you get organised, step by step. You don't need to sort everything out before choosing."
    },
    "energie": {
      "short": "a lack of time or energy",
      "antidote": "A 5-minute action is enough to move forward. No need to wait until you have energy."
    },
    "parfait": {
      "short": "waiting for the perfect person",
      "antidote": "Look for the right person for you, not the perfect person. Your non-negotiables are enough to sort things out."
    },
    "passe": {
      "short": "past wounds",
      "antidote": "Your past explains your caution; it doesn't decide your future. Getting support can help."
    }
  },
  "actions": {
    "a5": "Tomorrow, take 5 minutes for your next step. Do it before noon if you can.",
    "voix": "Say your commitment out loud, now. What we say out loud, we keep more often.",
    "rappel": "Your reminder: tomorrow at {heure}."
  },
  "times": [
    {
      "label": "8 am"
    },
    {
      "label": "12:30 pm"
    },
    {
      "label": "6 pm"
    },
    {
      "label": "9 pm"
    }
  ],
  "nextSteps": [
    {
      "label": "Say clearly what I need",
      "prefix": "This week, I'll say clearly what I need."
    },
    {
      "label": "Suggest an evening just for the 2 of us",
      "prefix": "This week, I'll suggest an evening just for the 2 of us."
    },
    {
      "label": "Ask the question that matters (children, plans, where to live)",
      "prefix": "This week, I'll ask the question that matters to me."
    },
    {
      "label": "Set a clear boundary",
      "prefix": "This week, I'll set a clear boundary."
    },
    {
      "label": "Take stock of my relationship with the Compass",
      "prefix": "This week, I'll take stock of my relationship with the Compass."
    },
    {
      "label": "Dare to say “I love you”",
      "prefix": "This week, I'll dare to say “I love you”."
    },
    {
      "label": "Take a few days to step back",
      "prefix": "This week, I'll take a few days to step back."
    },
    {
      "label": "Get some support",
      "prefix": "This week, I'll book a moment to get some support."
    }
  ],
  "moments": [
    {
      "label": "Tonight"
    },
    {
      "label": "Tomorrow"
    },
    {
      "label": "This weekend"
    },
    {
      "label": "This week"
    }
  ],
  "safety": {
    "present": {
      "title": "Before anything else",
      "text": "You said you're living with fear, belittling, control or threats in your current relationship. This isn't about compatibility or love languages, and it isn't your fault. You deserve to be safe. Talk to a professional or someone you trust. In France: 3919 (domestic violence, free and anonymous, 24/7), 17 or 112 in immediate danger, 114 by text if you can't talk. Outside France, call your country's emergency services."
    },
    "doute": {
      "title": "A question worth asking",
      "text": "You sometimes wonder whether what you're living through is normal. That doubt matters. Regularly feeling belittled or watched, or being afraid of the other person's reaction, is never just a difference in character. You can talk about it, with no commitment, to a professional. In France, 3919 also listens to people who have doubts (free and anonymous, 24/7)."
    }
  },
  "pastAbuseNote": "You said you lived through fear or belittling in a past relationship. What you went through wasn't your fault. If it still weighs on you, talking to a professional can really help you avoid living it again.",
  "riskGrid": [
    {
      "level": "Low",
      "label": "Differences of form, manageable",
      "text": "Tidiness, punctuality, habits, tastes. They call for humour and a few agreements, and can even complement you."
    },
    {
      "level": "High",
      "label": "Recurring friction, to negotiate",
      "text": "Topics that matter to you where the gap will keep coming back. They can be negotiated, as long as you talk about them early and find an agreement each of you can keep."
    },
    {
      "level": "Critical",
      "label": "Non-negotiable",
      "text": "Children or not, incompatible lifestyles, a need for freedom facing a need for extreme closeness, opposite core values. Here, one of you would end up giving up an essential part of themselves. Love isn't enough to bridge that gap."
    },
    {
      "level": "Off the scale",
      "label": "Warning signs",
      "text": "Contempt, humiliation, control, threats, physical, psychological or financial violence, and any harm to the body. These aren't incompatibilities: they're danger signs, which call for help from a professional."
    }
  ],
  "universal": [
    "Being respected, in words and in actions",
    "Being able to say no without being afraid",
    "Honesty on the topics that commit the couple",
    "No form of violence, threat or control"
  ],
  "universalCritical": "A partner who shows contempt, controls, threatens or is violent. It isn't an incompatibility: it's a warning sign, which calls for help from a professional.",
  "keyMessages": [
    "Falling for someone and feeling attracted aren't enough. They say “I like you”, not “we can be happy together”.",
    "You can be in love and unhappy. It isn't a paradox: it's a sign that something essential is missing for you.",
    "You can't change someone. Asking them to change is asking them to stop being themselves.",
    "The right question: can you live with their flaws in the long run? If so, they don't touch what's essential for you.",
    "Alike at heart, different in form: the same values but different talents is often the recipe for a lasting relationship."
  ],
  "sentences": {
    "need": "{prenom}, what truly feeds you: {n1}, {n2} and {n3}. You feel loved above all through {lang1} and {lang2}, and you recharge {rechargeShort}.",
    "danger": "What puts you at risk: {v1} and {v2}, a relationship that doesn't respect {val1}, and your brake: {brake1}.",
    "ennea": "Your Enneagram lead: type {n} ({name}), {instinct} subtype. Under heavy stress, you tend to {stress}."
  },
  "shareTemplate": [
    null,
    null,
    null,
    "Take the quiz: {quizUrl}"
  ],
  "exportTemplate": [
    null,
    null,
    null,
    null,
    null,
    null,
    "Free Discovery Call with Pierre Sarazin: {calendly}"
  ],
  "engine": {
    "needWords": {
      "reconnaissance": "recognition",
      "profondeur": "depth",
      "harmonie": "gentleness",
      "securite": "security",
      "liberte": "freedom",
      "legerete": "lightness"
    },
    "and": " and ",
    "or": " or ",
    "you": "You",
    "partnerWho": "A partner who {hint}",
    "noteNourrit": "What feeds you: {list}.",
    "noteVide": "What drains you: {list}.",
    "noteValeurs": "Your values, in order: {list}.",
    "noteDirection": "Your life-plan markers: {list}.",
    "noteDefauts": "What you find hard to live with in the other person: {list}.",
    "noteFrictions": "Under heavy stress, you tend to {fort}. Under moderate stress, you {modere}. Notice whether your arguments end in a real agreement.",
    "noteEnergie": "You recharge {recharge}.",
    "noteLangage": "You feel loved above all through {l1}, then {l2}.",
    "noteSousType": "Your dominant subtype: {name}.",
    "noteNonNeg": "Your non-negotiables according to the quiz: {list}.",
    "noteNoMore": "What you don't want to live through again: {short}.",
    "critBesoin": "My need for {word} is met ({title})",
    "critNourrit": "What feeds me: {short}",
    "critProjet": "Shared life plan: {short}",
    "critPartage": "We share {short}",
    "critEviter": "To avoid: {short}",
    "exportHead": "My love profile (working hypothesis): {name}.",
    "secBloom": "Your secondary need ({name}) matters too: {bloom}.",
    "secFade": "And since {lower} matters to you too, {fade}.",
    "stressGlance": "moderate → {modere} · heavy → {fort}",
    "moveAria": "Move “{label}”",
    "removeAria": "Remove “{label}” from the ranking",
    "toc": "Contents",
    "ctxGood": "Settings where you thrive",
    "ctxBad": "Settings that harm you",
    "nameOrder": "adj-noun",
    "semi": "; ",
    "dp": ": ",
    "colon": ":",
    "quote": "“{t}”"
  },
  "needs": {
    "securite": {
      "name": "Security and reliability",
      "title": "Anchor Heart",
      "desc": "You need to know where you stand. A partner who keeps their word, who shows up when they say they will, someone you can build a future with, without the rollercoaster. It isn't a lack of daring: it's where you can finally relax.",
      "partner": "Consistency, promises kept, clear plans. Someone who reassures you through actions, not just words.",
      "anti": "You never know where you stand. Broken promises, unpredictable mood swings and a vague future slowly wear you out. In that setting, you become watchful and anxious, and you lose your lightness.",
      "lower": "security and reliability",
      "danger": "a relationship where you never know where you stand"
    },
    "liberte": {
      "name": "Freedom and space",
      "title": "Free Heart",
      "desc": "You need to stay yourself in the relationship: your friends, your projects, your time alone. It isn't a lack of love. Quite the opposite: it's by breathing that you come back to the other person, eager to see them.",
      "partner": "Someone who trusts you, who has a life of their own, and who lets you go off for a few hours without feeling abandoned.",
      "anti": "You have to justify everything. Questions about your schedule, jealousy, and reproaches when you see your friends switch you off. In that setting, you feel cramped and end up running away, in your head or for real.",
      "lower": "freedom and space",
      "danger": "a relationship where you have to justify everything"
    },
    "reconnaissance": {
      "name": "Recognition and admiration",
      "title": "Radiant Heart",
      "desc": "You need to feel chosen, admired, valued. It isn't vanity: it's the sign that the other person truly sees you, and what you bring.",
      "partner": "Someone who is proud of you, who knows how to say “thank you” and “well done”, even in front of others.",
      "anti": "Your efforts go unnoticed and you're taken for granted. Mockery, comparison and a lack of gratitude dim your light. In that setting, you doubt yourself and overdo it to finally be seen.",
      "lower": "recognition and admiration",
      "danger": "a relationship where your efforts go unnoticed"
    },
    "profondeur": {
      "name": "Depth and emotional intimacy",
      "title": "Deep Heart",
      "desc": "You need to be able to say everything and to be understood, feelings included. Real conversations, shared vulnerability and the feeling of being deeply known connect you more than anything.",
      "partner": "Someone who listens, who cares about what you feel, and who dares to talk about themselves too.",
      "anti": "Conversations stay on the surface and feelings go unspoken. A partner who changes the subject, dodges important talks or mocks your sensitivity isolates you. In that setting, you feel alone even as a couple.",
      "lower": "depth and emotional intimacy",
      "danger": "a relationship that stays on the surface"
    },
    "legerete": {
      "name": "Playfulness and lightness",
      "title": "Playful Heart",
      "desc": "You need to laugh, to play, to discover. For you, a relationship is an adventure, a bond of fun, a playground. Without lightness, even a beautiful story ends up feeling grey.",
      "partner": "Someone with a sense of humour, who loves trying new things and doesn't take everything seriously.",
      "anti": "Everything becomes heavy, serious, routine. Constant reproaches, no plans, the same evenings over and over switch you off. In that setting, you get bored and look for the spark elsewhere, sometimes without meaning to.",
      "lower": "playfulness and lightness",
      "danger": "a heavy, routine relationship"
    },
    "harmonie": {
      "name": "Gentleness and harmony",
      "title": "Peaceful Heart",
      "desc": "You need a gentle, peaceful daily life. It isn't about avoiding disagreements: it's about living through them without shouting, digs or lingering tension. Peace is the soil you grow in.",
      "partner": "Someone calm, kind with their words, who knows how to argue without hurting, then make up.",
      "anti": "Digs and raised voices become normal. Conflicts that fester, irony and tension that lasts for days wear you out. In that setting, you close up and avoid every sensitive topic, which ends up widening the distance.",
      "lower": "gentleness and harmony",
      "danger": "a relationship full of digs and tension"
    }
  },
  "recharge": {
    "solitaire": {
      "title": "Recharging alone",
      "short": "alone, in peace and quiet",
      "couple": "You need time alone to come back to the other person with real desire. It isn't rejection, it's your fuel.",
      "fit": "A partner who has a life of their own and doesn't take your time alone as abandonment.",
      "risk": "A partner who needs you every evening, or who fills the diary without asking you."
    },
    "relationnel": {
      "title": "Recharging together, gently",
      "short": "through gentle moments together",
      "couple": "You regain strength just by being with the other person, relaxed, with nothing planned.",
      "fit": "A partner who is available for simple evenings, phone put away.",
      "risk": "A partner who is always elsewhere, absorbed by work or nights out."
    },
    "sensoriel": {
      "title": "Recharging through the body and the concrete",
      "short": "through your body, nature and concrete things",
      "couple": "You recharge by doing: moving, cooking, walking, making things with your hands.",
      "fit": "A partner who's up for doing things with you, or who lets you do them on your own.",
      "risk": "A partner glued to their screens, who finds your activities pointless."
    },
    "evasion": {
      "title": "Recharging by escaping",
      "short": "by escaping into ideas and stories",
      "couple": "You recharge by exploring: reading, discovering, dreaming, talking about ideas.",
      "fit": "A curious partner to share a discovery with, or who respects your bubble.",
      "risk": "A partner who mocks your interests or keeps bursting your bubble."
    },
    "elan": {
      "title": "Recharging with people",
      "short": "with people and movement",
      "couple": "You recharge by seeing people: outings, friends, lively evenings.",
      "fit": "A partner who loves going out, or who lets you go out without jealousy.",
      "risk": "A real homebody partner who takes your nights out as a betrayal."
    }
  },
  "languages": {
    "paroles": {
      "name": "Words of affirmation",
      "lower": "words of affirmation",
      "recv": "Words matter enormously to you. A sincere compliment, an “I love you” at the right moment, a message that acknowledges what you do can fill you up for days. On the other hand, a curt criticism or a long silence can hurt you more than the other person imagines.",
      "tips": [
        "Tell your partner clearly: “What touches me most is when you tell me what you appreciate about me.”",
        "Notice kind words when they come, and say thank you: people want to do it again when it's well received.",
        "If criticism is frequent, ask for it to be about a specific fact, never about you as a person."
      ],
      "partnerHint": "tells you what they feel, and what they love about you"
    },
    "moments": {
      "name": "Quality time",
      "lower": "quality time",
      "recv": "For you, love means being there. Not just in the same room: really there, no screens, listening. An evening when the other person truly listens to you is worth more than a beautiful gift. When you're put last, again and again, you end up doubting that you matter.",
      "tips": [
        "Suggest a regular date, even a short one: 30 minutes a day without phones, or 1 evening a week just for the 2 of you.",
        "Say what matters: “When you put your phone down to listen to me, I feel loved.”",
        "Spot the shared moments that already exist (a coffee, a commute) and truly enjoy them."
      ],
      "partnerHint": "makes time for you and truly listens, without their phone"
    },
    "cadeaux": {
      "name": "Gifts",
      "lower": "gifts and thoughtful gestures",
      "recv": "It isn't about price. What touches you is the proof that the other person thought of you: a little note, something picked up on the way, a gesture for a date that matters. Forgetting, especially again and again, can make you feel invisible.",
      "tips": [
        "Explain that it isn't about things: “A little something that shows you thought of me touches me enormously.”",
        "Share your important dates and a few simple ideas: people can't always guess.",
        "Keep a record of the gestures you receive (a box, a photo): it feels good to look back at them on hard days."
      ],
      "partnerHint": "thinks of you and shows it with small gestures"
    },
    "services": {
      "name": "Acts of service",
      "lower": "acts of service",
      "recv": "For you, love shows in actions. When the other person handles a chore without being asked, thinks of what weighs on you, and truly shares daily life, you feel loved. Fine words without actions, on the other hand, ring hollow.",
      "tips": [
        "Say exactly what would help you: “If you take care of the shopping on Saturdays, I feel supported.”",
        "Say thank you for the help, and explain that this is how you feel loved.",
        "If the load has been unbalanced for a long time, raise the topic calmly, with a list to back it up."
      ],
      "partnerHint": "pitches in and truly shares daily life"
    },
    "toucher": {
      "name": "Physical touch",
      "lower": "touch",
      "recv": "For you, physical contact comes first: a held hand, a hug, a caress in passing. It reassures you and brings you closer to the other person, and not only in bed. A partner who isn't very tactile can make you feel rejected, even if they love you.",
      "tips": [
        "Just say it: “A hug in the morning, your hand in mine, that's what reassures me most.”",
        "Suggest everyday gestures, not only intimate moments.",
        "If the other person isn't very tactile, look together for gestures that suit them too, without forcing."
      ],
      "partnerHint": "loves hugs and gives them without you having to ask"
    }
  },
  "screens": [
    {
      "eyebrow": "What feeds you, what drains you",
      "title": "Tick at least 3 things that feed you, and at least 2 that drain you.",
      "groups": [
        {
          "title": "What feeds me in a relationship",
          "stepTitle": "Tick at least 3 things that feed you.",
          "counter": "What feeds me",
          "items": [
            {
              "label": "Being truly listened to",
              "hint": "They put their phone down when I talk.",
              "short": "being listened to"
            },
            {
              "label": "Laughing together",
              "hint": "Fits of laughter, jokes nobody else gets.",
              "short": "laughing together"
            },
            {
              "label": "Being able to count on each other",
              "hint": "What's promised gets done, without me having to chase.",
              "short": "being able to count on each other"
            },
            {
              "label": "Keeping my own space",
              "hint": "My evenings, my friends, my own projects.",
              "short": "keeping your own space"
            },
            {
              "label": "Everyday tenderness",
              "hint": "A hug in passing, a hand on my back.",
              "short": "everyday tenderness"
            },
            {
              "label": "Feeling admired",
              "hint": "They're proud of me, and they say so.",
              "short": "feeling admired"
            },
            {
              "label": "Building projects together",
              "hint": "A trip, a home, a shared dream.",
              "short": "building projects together"
            },
            {
              "label": "Adventure and new things",
              "hint": "Leaving on a whim, trying a new place.",
              "short": "adventure and new things"
            },
            {
              "label": "A calm, gentle daily life",
              "hint": "Quiet evenings, without tension.",
              "short": "a calm, gentle daily life"
            },
            {
              "label": "Deep conversations",
              "hint": "Talking about our feelings and fears, late into the night.",
              "short": "deep conversations"
            },
            {
              "label": "Our little rituals",
              "hint": "The morning coffee, the Sunday night film.",
              "short": "your little rituals"
            },
            {
              "label": "Being supported in my projects",
              "hint": "They cheer me on when I have doubts.",
              "short": "being supported"
            },
            {
              "label": "Desire and physical closeness",
              "hint": "Feeling desired, long after the start.",
              "short": "desire and closeness"
            },
            {
              "label": "Sharing chores without keeping score",
              "hint": "Everyone does their part, without having to negotiate.",
              "short": "sharing the chores"
            }
          ],
          "other": {
            "label": "Other",
            "placeholder": "Write what feeds you"
          }
        },
        {
          "title": "What drains me in a relationship",
          "stepTitle": "Tick at least 2 things that drain you.",
          "counter": "What drains me",
          "items": [
            {
              "label": "Having to justify everything",
              "hint": "Where were you? Who with? Why so late?",
              "short": "having to justify everything"
            },
            {
              "label": "Constant criticism",
              "hint": "Nothing is ever good enough.",
              "short": "constant criticism"
            },
            {
              "label": "Silences and sulking",
              "hint": "They sulk for days.",
              "short": "silences that drag on"
            },
            {
              "label": "Shouting and digs",
              "hint": "Voices rise fast, little remarks that hurt.",
              "short": "shouting and digs"
            },
            {
              "label": "Never knowing where we're heading",
              "hint": "No plans, no clear commitment.",
              "short": "never knowing where you're heading"
            },
            {
              "label": "Carrying the daily load alone",
              "hint": "Shopping, appointments, housework: it all rests on me.",
              "short": "carrying the daily load alone"
            },
            {
              "label": "An absent partner, always on their screen",
              "hint": "There in body, somewhere else in their head.",
              "short": "an absent partner"
            },
            {
              "label": "Jealousy",
              "hint": "Every night out with friends turns into a drama.",
              "short": "jealousy"
            },
            {
              "label": "Routine with no surprises",
              "hint": "The same evenings, again and again.",
              "short": "routine with no surprises"
            },
            {
              "label": "Broken promises",
              "hint": "“We'll talk about it tomorrow”, and tomorrow never comes.",
              "short": "broken promises"
            },
            {
              "label": "Feeling smothered",
              "hint": "Doing everything together, all the time.",
              "short": "feeling smothered"
            },
            {
              "label": "Indifference",
              "hint": "My efforts go unnoticed.",
              "short": "indifference"
            }
          ],
          "other": {
            "placeholder": "Write what drains you",
            "addLabel": "+ Add another line"
          }
        }
      ],
      "rank": {
        "title": "Put first what matters most to you.",
        "cta": "Rank my choices →",
        "divider": {
          "text": "First: what you don't want to live through again."
        }
      }
    },
    {
      "eyebrow": "What recharges you",
      "title": "What truly recharges you? Tick at least 2 things for the evening and at least 2 for the weekend.",
      "help": "A relationship that suits you gives you energy. It doesn't take it away.",
      "groups": [
        {
          "title": "In the evening, to recharge your batteries",
          "counter": "Evening",
          "items": [
            {
              "label": "Some quiet time alone",
              "hint": "Nobody asks me for anything for half an hour.",
              "short": "some quiet time alone"
            },
            {
              "label": "Telling the other about my day",
              "hint": "On the sofa, no screens.",
              "short": "telling the other about your day"
            },
            {
              "label": "Moving",
              "hint": "A run, some yoga, a walk.",
              "short": "moving"
            },
            {
              "label": "Doing something with my hands",
              "hint": "Cooking, DIY, gardening.",
              "short": "doing something with your hands"
            },
            {
              "label": "Escaping",
              "hint": "A book, a series, a podcast.",
              "short": "escaping"
            },
            {
              "label": "Seeing people",
              "hint": "A drink with friends, a call that does you good.",
              "short": "seeing people"
            },
            {
              "label": "A tender moment",
              "hint": "A long hug, a massage.",
              "short": "a tender moment"
            },
            {
              "label": "Doing nothing, peacefully",
              "hint": "A bath, a candle, my playlist.",
              "short": "doing nothing, peacefully"
            }
          ],
          "other": {
            "label": "Other",
            "placeholder": "Write what recharges you"
          }
        },
        {
          "title": "At the weekend, to start Monday refreshed",
          "counter": "Weekend",
          "items": [
            {
              "label": "Nothing planned",
              "hint": "No alarm, no schedule.",
              "short": "nothing planned"
            },
            {
              "label": "Time just for me",
              "hint": "A few hours alone, guilt-free.",
              "short": "time just for you"
            },
            {
              "label": "Nature",
              "hint": "Forest, sea, mountains, a breath of fresh air.",
              "short": "nature"
            },
            {
              "label": "Sport",
              "hint": "Hiking, cycling, a match.",
              "short": "sport"
            },
            {
              "label": "Real time together",
              "hint": "A day just for the 2 of us, phones off.",
              "short": "real time together"
            },
            {
              "label": "My loved ones",
              "hint": "A family lunch, lifelong friends.",
              "short": "your loved ones"
            },
            {
              "label": "Going out, partying",
              "hint": "A concert, a dinner, dancing.",
              "short": "going out, partying"
            },
            {
              "label": "Discovering, learning",
              "hint": "An exhibition, a city, a workshop.",
              "short": "discovering, learning"
            },
            {
              "label": "Moving a personal project forward",
              "hint": "Writing, creating, building.",
              "short": "moving a personal project forward"
            }
          ],
          "other": {
            "label": "Other",
            "placeholder": "Write what recharges you"
          }
        }
      ]
    },
    {
      "eyebrow": "Your love languages",
      "title": "To feel loved, what matters most?",
      "help": "Put first what speaks to you most. 2 are enough. You can tap the cards in order, or drag them.",
      "footnote": "Based on Gary Chapman's 5 love languages.",
      "items": [
        {
          "label": "Words of affirmation",
          "hint": "“I'm proud of you.”"
        },
        {
          "label": "Quality time",
          "hint": "An evening just for the 2 of you, phones put away."
        },
        {
          "label": "Thoughtful gestures and gifts",
          "hint": "A little note, your favourite treat."
        },
        {
          "label": "Acts of service",
          "hint": "Dinner is ready, the chore is done."
        },
        {
          "label": "Physical touch",
          "hint": "A hug, a held hand."
        }
      ]
    },
    {
      "eyebrow": "Your Enneagram lead",
      "title": "Which sentences sound like you? Tick the ones that speak to you, or skip.",
      "help": "It's a starting point, not a verdict.",
      "groups": [
        {
          "items": [
            {
              "label": "“I immediately see what could be better.”",
              "hint": "People say I'm demanding. I am, with myself first."
            },
            {
              "label": "“I sense what others need, before they do.”",
              "hint": "I give a lot, and sometimes forget to ask."
            },
            {
              "label": "“I move forward, I succeed, and I like it to show.”",
              "hint": "Goals, efficiency: I hate wasting time."
            },
            {
              "label": "“I feel everything more strongly than others.”",
              "hint": "I need things to be real; the superficial bores me."
            },
            {
              "label": "“I need to understand, and for that, I need my space.”",
              "hint": "I think before I speak, and I recharge alone."
            },
            {
              "label": "“I think about what could go wrong, to protect my people.”",
              "hint": "Trust is earned, and I'm loyal once it's there."
            },
            {
              "label": "“Life is too short to be bored.”",
              "hint": "Projects, travel, ideas: I hate feeling boxed in."
            },
            {
              "label": "“I go for it, I say things to people's faces, and nobody controls me.”",
              "hint": "Direct and protective, I find it hard to show my weaknesses."
            },
            {
              "label": "“As long as everyone's fine, I'm fine.”",
              "hint": "I adapt easily, sometimes to the point of forgetting myself."
            }
          ]
        }
      ],
      "rank": {
        "title": "Put first the sentence that sounds most like you."
      }
    },
    {
      "eyebrow": "Your values",
      "title": "Choose 3 to 5 values that matter most to you.",
      "groups": [
        {
          "counter": "Values",
          "items": [
            {
              "label": "Honesty",
              "hint": "Telling each other the truth, without hiding what matters."
            },
            {
              "label": "Faithfulness",
              "hint": "Exclusivity, loyalty and commitment."
            },
            {
              "label": "Respect",
              "hint": "No contempt, no low blows."
            },
            {
              "label": "Family",
              "hint": "Your loved ones and your roots matter a lot."
            },
            {
              "label": "Having children",
              "hint": "Starting a family, or growing it."
            },
            {
              "label": "A life without children",
              "hint": "The couple first, with no plans for children."
            },
            {
              "label": "Freedom",
              "hint": "Each keeps their own life, choices and independence."
            },
            {
              "label": "Ambition",
              "hint": "Succeeding, pushing yourself, growing."
            },
            {
              "label": "Simplicity",
              "hint": "A simple life, without always chasing more."
            },
            {
              "label": "Adventure",
              "hint": "Travelling, moving, a change of scene."
            },
            {
              "label": "Humour",
              "hint": "Not taking yourselves too seriously."
            },
            {
              "label": "Culture and curiosity",
              "hint": "Books, exhibitions, discussions, always learning."
            },
            {
              "label": "Health and sport",
              "hint": "Taking care of your body."
            },
            {
              "label": "Solidarity",
              "hint": "Getting involved for others."
            },
            {
              "label": "Creativity",
              "hint": "Creating, inventing, expressing yourself."
            }
          ],
          "other": {
            "label": "My own value",
            "placeholder": "Add your value"
          }
        }
      ],
      "rank": {
        "title": "What are your 3 most important values?",
        "help": "Tap them in order, from most to least important.",
        "cta": "Choose my top 3 →"
      }
    },
    {
      "eyebrow": "Your subtype in a relationship",
      "title": "Which way of living as a couple sounds most like you?",
      "help": "Tap the cards in order. The first becomes your #1. Tap it again to remove it.",
      "items": [
        {
          "label": "Home · I take care of our nest",
          "hint": "A quiet cocoon, at home."
        },
        {
          "label": "Social · I love seeing people",
          "hint": "A dinner with friends."
        },
        {
          "label": "Just the 2 of us · I want a strong bond",
          "hint": "A long moment, just the 2 of us."
        }
      ]
    },
    {
      "eyebrow": "You, under stress",
      "title": "How do you react when things heat up? Tick at least 1 reaction for each level of stress.",
      "groups": [
        {
          "title": "Moderate stress",
          "help": "A misunderstanding, a delay, a remark that stings.",
          "counter": "Moderate stress",
          "items": [
            {
              "label": "I take charge",
              "hint": "I decide fast, I want things to move."
            },
            {
              "label": "I lighten the mood",
              "hint": "I talk, I joke, I try to ease the tension."
            },
            {
              "label": "I lie low",
              "hint": "I wait for it to pass, I avoid making waves."
            },
            {
              "label": "I analyse",
              "hint": "I want facts, I look for what really happened."
            }
          ]
        },
        {
          "title": "Heavy stress",
          "help": "A big argument, the fear of losing the other.",
          "counter": "Heavy stress",
          "items": [
            {
              "label": "I hit back",
              "hint": "Voices rise, I want the last word."
            },
            {
              "label": "I run away",
              "hint": "I slam the door, I go out, I keep busy elsewhere."
            },
            {
              "label": "I freeze",
              "hint": "I can no longer speak or think."
            },
            {
              "label": "I give in to keep the peace",
              "hint": "I say yes, I apologise, even when I don't agree."
            }
          ]
        }
      ]
    },
    {
      "eyebrow": "What holds you back",
      "title": "What holds you back or makes you uneasy in love?",
      "help": "What blocks you, what bothers you, or what makes you less keen to move forward with someone. Tick what speaks to you.",
      "groups": [
        {
          "items": [
            {
              "label": "Fear of being rejected",
              "hint": "What if they said no?"
            },
            {
              "label": "Fear of hurting the other",
              "hint": "I'd rather keep quiet than cause pain."
            },
            {
              "label": "Waiting for the right moment",
              "hint": "After the holidays, after their birthday..."
            },
            {
              "label": "Hoping the other will change",
              "hint": "It'll sort itself out."
            },
            {
              "label": "The comfort of habit",
              "hint": "It isn't perfect, but it's familiar."
            },
            {
              "label": "Fear of being alone",
              "hint": "Better in bad company than alone?"
            },
            {
              "label": "Not knowing what I want",
              "hint": "Yes one day, no the next."
            },
            {
              "label": "What others think",
              "hint": "Family, friends, what they'll say."
            },
            {
              "label": "Practical constraints",
              "hint": "Housing, money, children, logistics."
            },
            {
              "label": "Lack of time or energy",
              "hint": "In the evening, I have no strength left."
            },
            {
              "label": "Waiting for the perfect person",
              "hint": "Nobody is ever quite good enough."
            },
            {
              "label": "Past wounds",
              "hint": "I've been hurt before, so I protect myself."
            }
          ],
          "other": {
            "label": "Other",
            "placeholder": "Write what holds you back"
          }
        }
      ]
    }
  ],
  "ui": {
    "pageTitle": "Discover your love profile",
    "brand": "Magic Humans · Love Quiz",
    "footer": "Magic Humans · This quiz offers food for thought, not a diagnosis. Your answers stay on this device so you can pick up where you left off. Nothing is sent.",
    "footerSalle": "Magic Humans · This quiz offers food for thought, not a diagnosis. Your answers stay on this device so you can pick up where you left off. Only your anonymous profile is counted for the room snapshot.",
    "intro": {
      "eyebrow": "Love Summit · Free · 8 questions · about 8 minutes",
      "h1": "Discover your <em>love profile</em>",
      "lead": "Love at first sight isn't enough to build a happy relationship. In 8 minutes, take stock of what feeds you, what drains you, and the kind of partner who truly suits you.",
      "bullets": [
        "What feeds you in a relationship, and what drains you",
        "What recharges you, so you stop wearing yourself out in a relationship",
        "Your love languages, your values and your Enneagram lead",
        "How you react when things heat up, and what holds you back"
      ],
      "howto": "Answer without overthinking: your first idea is often the right one. There are no right or wrong answers.",
      "nameLabel": "Your first name",
      "nameHelp": "It's only used to personalise your results.",
      "start": "Start →"
    },
    "quiz": {
      "progress": "Question {i} of {n}",
      "rankSuffix": " · Rank",
      "counter": "{label}: {x}/{min} minimum",
      "counterBare": "{x}/{min} minimum",
      "counterMax": "{label}: {x}/{max}, minimum {min}",
      "maxValues": "5 values maximum. Remove one to swap it.",
      "topCounter": "Your top 3: {x}/{n}",
      "topSuffix": " · Your top 3",
      "untap": "“{label}” removed from your top 3.",
      "rankHelp": "Drag the cards, or use the ↑ ↓ arrows.",
      "rankTapHelp": "Put first the one that speaks to you most. Tap the cards in order, or drag them.",
      "rankCounter": "Ranked: {x}/{min} minimum",
      "rankEmpty": "Tap a card below to place it.",
      "rankZone": "Your ranking",
      "rankOrder": "Your order: {x}/{n}",
      "rankReset": "Start over",
      "rankUndo": "“{label}” removed from your order.",
      "rankCleared": "Order cleared.",
      "up": "Move up",
      "down": "Move down",
      "remove": "Remove from the ranking",
      "live": "{label}, position {pos} of {total}.",
      "grabbed": "{label} picked up. Arrows to move, Space to drop, Escape to cancel.",
      "placed": "“{label}” placed in position {pos} of {total}.",
      "unchecked": "“{label}” has been unticked.",
      "addOther": "+ Add another value",
      "removeLine": "Remove",
      "next": "Next →",
      "prev": "← Back",
      "skip": "Skip",
      "finish": "See my results →",
      "more": "{k} more to go on.",
      "moreDown": "Tick {k} more for “{label}”, further down ↓",
      "idea": "Idea: {antidote}",
      "timeAsk": "What time tomorrow?",
      "engagementCounter": "Write your commitment and pick a moment",
      "resumeNotice": "Picking up where you left off",
      "resumeRestart": "Start over",
      "engagementLabel": "My commitment",
      "shareBlock": "Share it with someone, and pick a moment.",
      "whoLabel": "With whom?",
      "whenLabel": "When?"
    },
    "results": {
      "headerNamed": "{prenom}, here is your love profile",
      "headerAnon": "Here is your love profile",
      "sentencesH": "Your profile in 3 sentences",
      "glanceH": "Your rankings at a glance",
      "detailsSummary": "See my detailed profile",
      "copyShortBtn": "Copy my 3 sentences",
      "shareBtn": "Share",
      "stickyCta": "Talk with Pierre",
      "stickyClose": "Close",
      "salleH": "Tonight's room snapshot",
      "salleWait": "The snapshot appears from 5 participants.",
      "salleRefresh": "Refresh",
      "salleTotal": "{n} participants",
      "salleYou": "You",
      "salleCompat": "The profile most compatible with you, {name}, makes up {pct}% of the room.",
      "boussoleNote": "Your Compass will be preset with your results.",
      "nourritLab": "What feeds you",
      "videLab": "What drains you",
      "langLab": "Your love languages",
      "valuesLab": "Your values",
      "instinctLab": "Your subtype",
      "rechargeLab": "How you recharge",
      "stressLab": "Under stress",
      "brakeLab": "Your #1 brake",
      "demainLab": "Tomorrow",
      "stepLab": "Your commitment",
      "noMoreMark": "what you don't want to live through again",
      "nnMark": "non-negotiable",
      "shareWith": "to share with {who}",
      "icsBtn": "Add the reminder to my calendar",
      "discussPrefix": "To talk about:",
      "relive": "A partner who makes you relive {short}.",
      "ownOpposite": "A partner who doesn't share “{texte}”.",
      "needsH": "What feeds you, what drains you",
      "ressH": "What recharges you",
      "langH": "Your love languages",
      "enneaH": "Your Enneagram lead",
      "instinctH": "Your subtype",
      "stressH": "You under stress",
      "brakesH": "What holds you back",
      "partnerH": "The partner who suits you",
      "partnerIntro": "The partner who suits you, based on your answers.",
      "completeLab": "Who completes you",
      "frictionLab": "Where it may get stuck (to negotiate)",
      "criticalLab": "Incompatible for you (non-negotiable)",
      "gridH": "How to read the risk levels",
      "keyH": "What to remember",
      "piegeLab": "Your trap:",
      "pairPrefix": "With a {name} partner:",
      "pairsNote": "These are only tendencies. They show where things may get stuck, so you can talk about it early.",
      "tipsLab": "In practice",
      "rechargeRule": "The golden rule: after time together, you should have more energy than before. If a relationship drains you for a long time, it isn't a detail: it means something.",
      "rechargeSame": "The way you recharge is clear: {title}.",
      "rechargeMixed": "You recharge in 2 ways: {soirTitle} during the week, {weekendTitle} at the weekend.",
      "boussoleLab": "The Relationship Compass",
      "boussoleP": "Are you in a relationship, or unsure about one? The Relationship Compass helps you weigh it up calmly, one criterion at a time. It will be preset with your results: your needs, what drains you, the flaws you can live with and your non-negotiables. An alert shows up if something essential is hit, whatever the score.",
      "boussoleBtn": "Assess my relationship with the Compass →",
      "ctaEyebrow": "Discovery Call · free",
      "ctaH": "Shall we talk about it together?",
      "ctaP": "Your love profile says a lot about your Unique Talent. Let's talk for 1 hour, free, so you can choose better, in love as in your work life.",
      "ctaSign": "Pierre Sarazin, Talent Profiler coach, Magic Humans",
      "ctaBtn": "Book my free Discovery Call →",
      "siteBtn": "Discover Magic Humans",
      "exportH": "Keep my results",
      "exportP": "Copy this text to keep it in your notes, or to reread it before your Discovery Call.",
      "copyBtn": "Copy my results",
      "copied": "Copied!",
      "copyFallback": "Select the text, then copy it.",
      "matchingH": "Coming soon: meetings between participants",
      "matchingP": "A project to connect Summit participants is in the works. The principle is simple: no contact details are ever shared without double consent, yours and the other person's. This quiz sends nothing. If you're interested, just write to {email} with your first name.",
      "restart": "Take the quiz again",
      "ethicsH": "An important note",
      "ethicsP": "This quiz is not a diagnostic tool. If you're living with fear, humiliation, control or violence in your relationship, it isn't a compatibility problem: talk to a professional. In France: 3919 (domestic violence, free and anonymous, 24/7), 17 or 112 in immediate danger, 114 by text. Outside France, call your country's emergency services.",
      "pastH": "A past relationship",
      "nowH": "What now?",
      "petitPasLabel": "And you, what small step will you take this week?",
      "petitPasPh": "Example: say tonight what I need.",
      "petitPasHint": "Optional. It stays on this device.",
      "petitPasExport": "My small step this week: “{texte}”",
      "nowStep": "Your next step",
      "nowStepEmpty": "Pick a small step for your relationship this week.",
      "nowTest": "Test your relationship",
      "nowTestP": "Check whether your partner (current or future) truly suits you, one criterion at a time.",
      "nowBoussole": "Open my Relationship Compass",
      "nowTalent": "And at work? Discover your Unique Talent in 6 minutes with the free quiz.",
      "saveH": "Save my results",
      "saveP": "Enter your email address: your results are linked to your account and you'll find them in your Relationship Compass, on all your devices.",
      "saveLabel": "Your email address",
      "savePlaceholder": "name@example.com",
      "saveBtn": "Save my results",
      "saveNote": "Free and no password: you'll get a link to confirm your address.",
      "saveError": "Check your email address, it looks incomplete.",
      "nowPierre": "Take stock with Pierre",
      "nowCall": "Book my free Discovery Call",
      "nowPdf": "Download my profile (PDF)",
      "nowGeneric": "In 1 hour, free, we link your love profile to your Unique Talent.",
      "nowStress": {
        "fight": "When things really heat up, you tend to hit back.",
        "flight": "When things really heat up, you tend to run away.",
        "freeze": "When things really heat up, you tend to freeze.",
        "fawn": "When things really heat up, you tend to give in to calm things down."
      },
      "talentH": "What your profile says about your Unique Talent",
      "talent": {
        "securite": "In love, you need to know who you can count on. And it's probably the same elsewhere: at work and in your projects, you give your best when the rules are clear and people keep their word. That's your Trigger Context. On the other hand, vagueness that drags on switches you off: that's your Anti-Context.",
        "profondeur": "You need things to be real, with conversations that get to the heart of things. This need doesn't stop at your relationship: your talent often hides right there, in the way you understand people better than most. Your Trigger Context is sincere exchanges, without masks. Your Anti-Context is relationships that stay on the surface.",
        "admiration": "You need what you give to be seen. It isn't ego, it's a driving force, and it works in your work life too: when your work is recognised, you gladly surpass yourself. Your Trigger Context is a place where what you bring truly counts. Your Anti-Context is staying in the shadows for too long.",
        "liberte": "You love better when you stay free to make your own choices. In the rest of your life too, you give your best when people trust you and let you do things your way. That's your Trigger Context. Your Anti-Context is being controlled or having to account for everything all the time.",
        "harmonie": "You need a gentle atmosphere to love fully. That says something about your talent: you know how to soothe, connect and help people feel good together. Your Trigger Context is a calm setting where people talk before things get stuck. Your Anti-Context is tension that lingers and never gets resolved.",
        "complicite": "For you, loving means being a team. And you probably work the same way: on your own, you get bored; with others, you take off. Your Trigger Context is a concrete project you carry together, in good spirits. Your Anti-Context is carrying everything alone, for too long.",
        "intensite": "You need things to spark. In love as elsewhere, flat routine switches you off, while a challenge wakes you up. That's a real lead for your Unique Talent: you give your best when there's something at stake and something new. That's your Trigger Context. Your Anti-Context is the same old routine with no surprises."
      },
      "meetH": "Where to meet someone who suits you",
      "meetLieux": "Places where you feel like yourself",
      "meetAct": "Activities that bring out the best in you",
      "meetShine": "The setting where you shine",
      "meetAvoid": "To avoid"
    }
  },
  "lang": "en"
};
if (typeof module !== "undefined" && module.exports) module.exports = AMOUR_DATA_EN;
else root.AMOUR_DATA_EN = AMOUR_DATA_EN;
})(typeof window !== "undefined" ? window : globalThis);
