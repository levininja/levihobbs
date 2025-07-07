import type { Bookshelf } from '../types/BookReviewTypes';
import type { BookReview } from '../types/BookReviewTypes';
import type { BookshelfGrouping } from '../types/BookReviewTypes';
import { generatePreviewText, calculateReadingTime } from '../utils/bookReviewUtils';

export const specialtyShelves: string[] = [
  "favorites",
  "featured", 
  "2025-reading-list",
  "history-of-lit",
  "friends"
];

// Long review content variables to avoid repetition
const finalEclipseReview = `It is so rare to read science fiction these days that both inspires the imagination and also teaches real science. <br/><br/>This last week I reviewed Three Body Problem, which I raved about because it does just that. Final Eclipse is another of the few. It has a small group of friends using deduction and science to battle against a conspiracy of unseen, sinister extraterrestrials who are hell-bent on conquering the planet.<br/><br/>And best of all (for a worldbuilding sucker like me), along the way you get to learn a lot about physics, history, and a smattering of so many others, from astronomy to sea ice to SOFAR to intriguing military technologies to why Iceland would be the best place on Earth to survive a winter apocalypse.<br/><br/>In addition to all that, this is also a very special book to me personally.<br/><br/>You see, about 6 years ago, I started a writer's group that meets at me and my wife's home. We set out to do one thing really well together: to give high quality constructive feedback regularly that manages to be both highly rigorous and uplifting.<br/><br/>Of the writers in that group, we've covered a lot of ground together over the years. We've struggled together to figure out so many things, encouraged each other in the lows, celebrated together in the highs.<br/>And several novels have gone through our group. But today, the first one is getting published.<br/><br/>I couldn't be more proud, because, as much as this book is definitely the brain-child of Matthew, it also feels a little bit like the child of the whole writer's group, the proverbial village that it takes to raise a child. It's Matthew's biological child, but we all got to participate in a really substantive way, and that's just really cool.<br/><br/>I often call Matthew the world's most fascinating man. He's a physics professor, a world traveler, an astronomer, a voracious reader of science fiction and many other genres, and he's always taking some absolutely epic trip somewhere, kayaking down a river in the Congo to be the first one to film a remote waterfall, or traveling to the Azores Islands to do research for his book, or to Iceland to do research for his book, or…did I mention this guy does some incredible research for his books? Who does that???<br/><br/>He's also just one of those people who are a seemingly infinite treasure trove of interesting information. And a gifted teacher. I've seen him teach complex physics topics to a mixed audience on the spot with ease.<br/><br/>Okay wow, I've gone far afield from talking about the book. The book!<br/><br/>Final Eclipse is epic. The first part is brooding. Our heroes and heroine become privy to the fact that the world as we know it is about to end. But almost no one on the planet knows it yet. People are just going about their days, few of them—outside a small handful of scientists—aware that there's any problem at all. But there is, and it's sinister.<br/><br/>Kevin's father is a top scientist at an agency that monitors satellites. Particular satellites: the ones that monitor the sun. And then one day, all of these satellites mysteriously go dead within a moment of each other.<br/><br/>What could it be? Equipment malfunction? Solar flare? They test out the standard list of theories, but nothing checks out. Until someone comes up with a strange theory.<br/><br/>You see, all of these satellites are at a very special location in space. If you're monitoring the sun, the best place to put your satellites is a location called L1. It's one of the LaGrange points: particular spots around the Earth wherein, if you put a satellite, the forces of gravity all equal out so that it will stay put indefinitely without you having to expend any energy to keep it there. The L1 point is the place partway in a line between the sun and Earth, at just the spot where the gravity of Earth and the gravity of the sun equal out, pulling in two exact opposite directions (obviously much closer to the Earth than the sun to compensate for the fact that the sun is 300,000 times heavier).<br/><br/>Anyways, what's such a big deal about this LaGrange point? Well if you think about it, if you wanted to put something between those two bodies…indefinitely…such as, I don't know, a huge shield to block all sunlight from getting to the Earth…voila.<br/><br/>Someone's out to kill all life on the planet.<br/><br/>The plot progresses along several lines. Without giving too much away, I'll just say that this is about good old fashioned fighting against the alien invaders, plus there's the pandemonium of the masses preparing for impending doom, there's the malice of nations against one another, there's militaries and nations and a bit of politics, but most importantly, there's the mystery unraveling slowly of figuring out: who exactly are these aliens? What kind of people would attack the earth in this way? How can we prepare for them? More is continually revealed as we adventure all over the globe, and it's quite satisfying.<br/><br/>Oh and one other thing. Far from reading like a textbook, this is pretty easy reading. In fact, one of the other writers in our group described it as "YA (young adult) for grown-ups," and I have to agree.<br/><br/>It's fun, but not stupid. I've read my fair share of bad YA. One of the classic YA pitfalls is to make it seem like for some reason, it's just the kids who are capable of doing anything to save the world, and all the adults are idiots…pure wish fulfillment. But this book is refreshing because it doesn't do that. The adults are doing the big plans and everything—much more realistic—but at the same time, our young heroes and heroine have a major part to play, and we get to see the world through their eyes. And it's just a lot more fun that way. I feel like I'm getting the best of both worlds.<br/><br/>Okay, if I talk any more about this book I'm going to give things away. Go out and read it today! It's a fun ride. Final Eclipse is perfect for young adult SF readers who want to learn some real science in their reads, adults who read YA sci-fi, readers who enjoy YA but are sick of the trope where all the adults are morons and only the kids can save the day, and anyone looking for the classic alien invasion story with a novel premise.`;
const odysseyReview = `I read Samuel Butler's translation, originally published in 1900, which is recommended if you're looking for a prose translation that retains some of the poetic language. I considered the older language that Butler uses to be fitting to me for reading something this ancient.<br/><br/>One of the fascinating things about Samuel Butler's translation is that it includes a preface, written by him, where he explains that he had published a book called The Authoress of the Odyssey in which he claimed that the author of the Odyssey was not in fact Homer (which wasn't so provocative an idea at the time), but was in fact a woman (which was).<br/><br/>Further, he goes on to speculate who the woman was and name a particular woman; he thinks she must have written herself into the story.<br/><br/>I did a little research on his claims, and it seems that scholars are open to the idea that the Odyssey could have in fact been written by a woman. The claims of who that particular woman was are pretty far-reaching, but the idea that it was probably not Homer isn't a stretch at all; there's evidence that it was probably composed hundreds of years after The Iliad.<br/><br/>Butler's theory stuck with me as I read, especially because The Odyssey is so full of domestic detail: food preparation, garments, household routines. There's a quiet authority in those passages, a specificity that feels lived rather than imagined.<br/><br/>As someone who has spent a lot of time with other writers in critique groups, I've come to believe that those unassuming little details—the subconscious ones, the things the author didn't think were important—are the best glimpses into the real person behind the pen. Anyone can write about war or love or loss, but the mundane details are harder to fake. They suggest proximity.<br/><br/>The structure of the story surprised me. Having read an abridged version as a kid, I expected most of the book to focus on Odysseus's island-hopping adventures. Instead, the majority centers on the suitors plot—Odysseus's wife dealing with persistent suitors while he's away, and his eventual return in disguise to deal with them. This storyline dominates the narrative, often feeling static as characters wait around talking while nothing happens. Meanwhile, some of Odysseus's most fascinating adventures get condensed to single paragraphs, which was frustrating.<br/><br/>Despite this structural imbalance, the book delivers moments of genuine power. Butler's translation captures beautiful poetic language throughout, and certain scenes have stayed with me long after reading. Achilles' haunting words from the underworld—I would rather be a paid servant in a poor man's house and be above ground than king of kings among the dead—perfectly encapsulate the Greek view of mortality that made The Iliad so compelling.<br/><br/>The scene with Argos, Odysseus's loyal dog, might be one of the most emotionally effective passages in all of ancient literature. The image of this neglected hound, full of fleas and lying on the heaps of mule and cow dung, who still recognizes his master after twenty years and dies as soon as he sees him, is heartbreaking in its simplicity.<br/><br/>There's also Odysseus's warning to Amphinomus about human vanity and the fickleness of fortune: Man is the vainest of all creatures that have their being upon earth. As long as heaven vouchsafes him health and strength, he thinks that he shall come to no harm hereafter. These philosophical moments elevate the narrative beyond mere adventure story.<br/><br/>The psychological complexity shows through in scenes like Odysseus describing his own clothing to his disguised wife in elaborate detail—the purple wool mantle with its gold brooch showing a dog holding a spotted fawn between his forepaws. It's both touching and slightly absurd, this moment of vanity from a hero in disguise.<br/><br/>Theoclymenus's prophetic vision near the end provides genuine chills: The air is alive with wailing voices; the walls and roof-beams drop blood; the gate of the cloisters and the court beyond them are full of ghosts trooping down into the night of hell. Butler's translation makes this supernatural moment feel appropriately ominous.<br/><br/>The Odyssey is a foundational work that rewards careful reading. Butler's translation, despite being over a century old, felt authentic to the ancient world, although admittedly I haven't compared it to other translations. The domestic details, the psychological complexity, and those moments of startling beauty make this worth the read. This translation of the Odyssey is perfect for lovers of the classics and those looking for a readable translation of the Odyssey.<br/><br/>By the way, when I read the story about Argos the Dog, I felt my heart was yanked about. We're given this sweet moment, but then suddenly the dog dies. Just like that, mentioned in an offhand manner. I thought to myself: what if a story were written from Argos' perspective that was more satisfying? What about a story where it actually makes sense that he dies at the end and it gives you a sense of the story being complete instead of incomplete? So I set out to do just that. If you're interested in reading it, here's my attempt at Odyssey fan fiction:<br/>https://levihobbs.substack.com/p/argos-the-dog`;
const nineteenEightyFourReview = `" classic dystopian novel that explores themes of surveillance, control, and the manipulation of truth.`;
const tenthOfDecemberReview = `A collection of short stories that showcase Saunders' unique voice and satirical style.`;
const kingArthurReview = `A retelling of the classic Arthurian legends for young readers.`;
const dontYouJustHateThatReview = `A humorous look at everyday annoyances and pet peeves.`;

// New review constants
const thelefthandofdarknessReview = `This didn't have the full story of the full book, so it's hard to give it five stars for that reason...there's as lot missing. However, it worked for me as a kind of way to have a "remix" of the original book, an alternate way of experiencing it if you've already experienced it. The production quality was top notch with great sound effects and voicing. Hearing the whistling of the wind alone was enough to add substantially to the empty feeling of this book.`;
const thelordoftheringsReview = `It was a joy to read this again after many years. I don't want to go this long between readings next time.  From the moment I started reading the prologue, this was so good. It's so refreshing after the years of reading many other things, many of which are mediocre, some downright bad, to come back to something I know is amazing. Right from the moment that I started reading Tolkien's forward on details about hobbits, their three races, etc, I knew I was home.<br/><br/>One of the best things about Tolkien is his voice. It's grandfatherly, very positive, very reassuring. Another thing, of course, is his worldbuilding. The languages you're exposed to, the poems (which are actually good, unlike most fantasy authors who have tried to pull this off), the appendices...in no other text have I enjoyed reading appendices so much. And the historical footnotes, wow. Those really give it a level of verisimilitude that is really endearing.<br/><br/>It was interesting to note, now that I've seen the movies a billion times, all of the differences between the movies and the books. I actually thought there were some ways in which the movies were a little better--blasphemy, I know. But in some places they just did better at increasing the sense of tension before release. Of course, the main area in which they are lacking is the full world, that feeling, as well as the almost relaxed at one-ness with nature that you can only get when reading a book; movies have to have a certain pace. It's hard to put into words what I mean there, but...you just have to read it to understand.<br/><br/>There's also the whole scouring and restoration of the shire at the end, which is highly satisfying--pity the movies didn't have time to do that. And Tom Bombadil. And Denethor has more nuance and wisdom in the books. And the death of Théoden is more properly grieved and dramatized. And there's the romance between Faramir and Éowyn which is really a fascinating dynamic. Her character is much better explored in the books. And I feel that Boromir gets a better treatment in the books as well. And you get Shelob's little epic backstory. And you get a better glimpse into the orcs' worlds, which I highly enjoyed.<br/><br/>If you haven't read this, read it. There is so much there that you haven't gotten through the movies. It's an experience. And you really especially don't want to miss getting to know Tolkien's voice. I feel like I know him and love him even though I've never met the man. I wish I could have.<br/><br/>The Lord of the Rings is perfect for those who love epic tales, beautiful prose, setting-driven fiction, transcendent myth-like tales, and anyone who reads fantasy and wants to discover the roots of the genre.`;
const twelvestepsandtwelvetraditionsReview = `I consider this the most foundational text for working the steps. The Big Book is powerful, but it was written while the founders of AA were still trying to get sober and it would be hard to argue that it has no flaws. The 12x12, on the other hand, I have found to be very thorough on every step and provide deep insights on each one. `;
const assassinsapprenticeReview = `This was my second read, and it was wonderful to notice all sorts of foreshadowings and other details that I didn't know to attach significance to the first time around, in addition to all of the other things that Robin Hobb does so well. Still one of my favorite fantasy novels. Looking forward to now reading the sequel a second time; I liked it even more.`;
const frogandtoadarefriendsReview = `These stories are just as good as an adult as they were when I was a child—perhaps more so. They are so simple and yet with basic vocabulary they manage to always show something that's really funny about the characters in a way that is insightful to the hilarious way we human beings can be. And they're things both kids and adults can relate to. I love these stories.`;
const religiousexplanationandscientificideologyReview = `This review will mostly ignore the fact that the author is my father and discuss it on an objective basis (at least, as far as such things can be done), but I'll have a few personal comments at the end.<br/><br/>Overview<br/>This is a book in the realm of epistemology, the realm of philosophy concerned with how we know things and what can be justified as a rational belief.<br/><br/>The main thesis of the book is that, while the philosophical literature on epistemology normally presents religion as ideological and of no explanatory value, and science is depicted as the gold standard of explanation, the reality is that the name of science is often invoked in epistemological arguments that are in fact ideological in basis, and furthermore, that there can be such a thing as rational religious explanations. The latter point is the main thesis of the book, and I'll come back to that.<br/><br/>One important term: explanations that include a positing of the existence of God are used interchangeably with "religious explanations," which I think he used as a shorthand for the former.<br/><br/>A Working Definition for God<br/>I found his definition of God for the purposes of this philosophical exercise to be interesting.<br/>"It seems necessary to restrict our discussion of God to entities satisfying five conditions:<br/>* immateriality<br/>* intelligence<br/>* ability to act<br/>* creator of the world<br/>* worthiness for worship.<br/>If no entity satisfies all of these, then there is no God."<br/><br/>As I pondered the usefulness of this set of five criteria, I thought to myself that I could reduce it to three:<br/>* immateriality<br/>* creator of the world<br/>* worthiness for worship<br/>Because after all, if God is creator of the world (read: universe), then it implies a being of so much power that this being would be essentially, by our reckoning, of nearly infinite power, simply based on that fact alone. It is probably logically inconsistent to claim that a being could be powerful enough to create the universe and yet be unable to act or not be intelligent.<br/><br/>This list is similar to the list I had constructed several years ago for myself. It seems to me that for a being to qualify as "God," it must at a minimum:<br/>* be beyond measurement (essentially the same as immateriality)<br/>* be all powerful (which, creator of the world is basically tantamount to that).<br/><br/>Conspicuously absent was the "worthiness of worship" part, but I think it was something I simply took for granted and didn't think to list. I was more thinking of the qualities of God intrinsic to him, rather than any conclusions about how humans should respond to him, which this trait seems to fall under the category of.<br/><br/>Religious Explanations<br/>Anyways. This book is primarily about religious explanations, which is a controversial idea sure to meet resistance both from scientific and religious authorities. But I think he makes an excellent argument for them.<br/><br/>First of all, while truly scientific explanations are splendid, there are many domains which by their very nature intrinsically preclude the ability to furnish explanations that meet all of the value criteria of science, but may still meet some of the criteria. He upholds the scientific values of clarity, consistency, and evidential support as being of universal value in any domain, while challenging that others (control, replicability, and prediction) should be required in nonscientific domains.<br/><br/>He aims to "reconstruct from religious contexts a system of cognitive values with broad application that takes exception to a number of scientific norms. These norms pertain to:<br/>1. the ranking of outstanding problem areas in importance<br/>2. the usefulness of anecdotal material<br/>3. the status of teleological explanations<br/>4. the degree to which pragmatic considerations govern theorizing<br/>5. standards for explanations in nonscientific areas."<br/><br/>Anecdotal Evidence<br/>He spends especial time on criteria 2, because he finds that anecdotal evidence is vital to revealed theology and is chronically undervalued in a dogmatic, ideological way. He argues that scientists are used to rejecting anecdotal evidence out-of-hand probably because they are used to being able to furnish higher-quality evidence, which of course is only right. However in the religious domain, anecdotal evidence is key, and furthermore is often the best type of evidence for different phenomenoa. <br/><br/>Furthermore, the idea that anecdotal evidence has no epistemological value in the realm of science is simply not true. Most theories that are now widely accepted were, at first, hypotheses that were only founded on anecdotal evidence. Because a scientist noticed how often the anecdotal evidence came up and formed a theory and went about testing it, we have wonderful scientific discoveries.<br/><br/>He gives first the example of the green flash at sunset phenomenon, which was for many years ridiculed by scientists as being made up by sailors but since then has been confirmed. He then gives another example of a phenomenon that is still in the realm of anecdotal evidence but which most scientists at this point believe must be real despite the lack of reproducibility: ball lightning. If you're not familiar with that particular phenomenon I highly recommend reading the Wikipedia article.<br/><br/>I'm getting long-winded, so I'll focus on wrapping up the last three chapters of the book.<br/><br/>Ideological Aspects of Science<br/>The next chapter is devoted to exploring ideological aspects of science--or rather by "science", he means the culture in which science is practiced. He points out that the world in which science is practiced is, in fact, a particular subculture, with its own set of cultural values and biases inherent to it. He then goes on to give a stab as to a proposed list of those values and even puts them into a table and categorizes them, which I found helpful and ambitious. It's a topic that personally fascinates me: in what ways is "science" carried out with biases and ideologies? <br/><br/>He explores the answers to that question in a rather satisfying way. He groups values together according to which ones are truly essential to the actual scientific method and which ones are more just values which have no epistemological value, and the enforcement of these values on science (and even more so on realms outside of science) is not rational but ideological.<br/><br/>He also explores exactly why it is that religious and scientific people so often are in conflict: it's a question of values. Very few of their values overlap and most are in conflict.<br/><br/>Near Death Experiences (NDEs)<br/>The next chapter takes an interesting turn. He assesses near-death experiences (NDEs). The reason why was not readily obvious to me, but it soon became apparent why. He strikes a parallel between the ball lightning example given earlier and NDEs. Both are examples of an area where, based on the preponderance of anecdotal evidence that actually is rather consistent in the things it reports, there is great reason to ascribe rational justification to believing that these things are real phenomena and not merely made up or psychological phenomena. Ball lightning is the example of one such area that most scientists (physicists, particularly) have actually begrudingly acknowledged must be real despite it not being reproducible (yet). NDEs is the example of one such area that has not been yet (as of the writing of his book) been readily accepted by the scientific community as real, but he believes that it would in fact be rationally justified in believing that these are real phenomena.<br/><br/>Why? Well, the answer is fascinating. NDEs sound cooky, but this book lays out a very excellent arguments that they do have some correspondence to reality. First though, some background information is essential.<br/><br/>First, NDEs have increased greatly in occurrence since the 70s because of medical techniques in reviving people after death becoming widespread (CPR, defibrillators, etc.). (And we are talking about people who literally died; the heart was not beating.) It turns out that a large percentage of people who die and come back (I think it was 10 or 20%) experience NDEs. They experience them in different cultures and they report remarkably consistent things despite many of them reporting in interviews that they had never consumed any literature or other media around NDEs before and had no knowledge of other NDE stories.<br/><br/>Second, there are two basic types of NDEs. One he dubs the transcental type: people report going to Heaven, Hell, or having mystical experiences, perhaps a tunnel of light, and receiving divine revelations. Naturally, none of this information is verifiable.<br/><br/>But the other major type of NDE is the naturalistic type: people report floating above the room, usually at about ceiling height, looking down, and observing things that were happening in the hospital room when they were supposedly unconscious. Not only that, but they report (after resuscitation) very specific things that were said and done to the medical personnel who are astounded because of the fact that those things did in fact happen.<br/><br/>Surely those were just flukes, right? Tall tales? Here's where it gets even better. Michael Sabom was a skeptic who set out to investigate these reported NDEs. He was uniquely positioned as a cardiologist who would be in the room when people would be brought back after death and these experiences would inevitably be reported. So he went about setting up an experiment to test for whether these experiences were real. He had a control group of patients and quizzed them and the NDE-reporters about basics of the cardiac procedures that were done on them. The NDE people were in fact able to report details of the procedure that they would have no business knowing with much greater accuracy than the control group. They were in fact observing things that happened in the room when they were supposedly unconscious and dead.<br/><br/>This single fact has become reality-altering to me and endlessly fascinating. Why is this not discussed more? Probably because of all the biases against NDEs that are based on the spiritual/religious aspect of the reports and the ideological stances against religious persons. Almost all people who have an NDE go on to become more spiritual and religious, and in fact, for those who attempted to commit suicide, none of them (none!) ever attempts suicide a second time, which is quite astounding considering that for the rest of the population who attempt suicide, the likelihood they will attempt again is quite high.<br/><br/>I could go on about this but suffice it to say, this is an area I must research further. Obviously the fact that NDEs of the naturalistic type are real then implies that the transcendental ones also have some form of correspondence to truth. This is really fascinating.<br/><br/>Constructing Religious Explanations<br/>The final chapter is on constructing religious explanations. It builds on all previous chapters to make the point that rationally justifiable explanations could (in certain circumstances) be constructed that involve, as a part of the explanation, the existence of a God. He then talks about modeling what could be said about that God that would be true based on the evidence we have. <br/><br/>But, as he points out, there are so many problems with us trying to assign intentionality to a God based on the things we can observe about the world. First there's a problem of a being of lesser intelligence trying to analyze a being of considerably greater intelligence. Second, there are all of the biases we have in trying to interpret God. We inevitably come up with analogies for God, but all of these usually have huge value-based biases baked into them. Are there ways in which God is like a father, for instance? Perhaps, but doesn't that view anthropomorphize God and might it not lead to considerable errors and biases?<br/><br/>He also talks briefly about the analogy of God being like the Wizard of Oz and another analogy of God being a provider and a fundamental paradox in that (related to the problem of evil). He then talks about modeling God as having multiple personalities and finally, explores a nascence archetype: ways in which perhaps God is like a child. This last part was a bit of a stretch for me and I felt needed to be explicated more in order to be more coherent.<br/><br/>The last chapter of the book gives one the impression that we haven't really gotten anywhere at all; one gest the idea that he wasn't really sure where to go from there himself. That experience can overshadow the fact that the rest of the book did cover some very good ground. Frankly, if he was alive I would recommend to him to rewrite the book with a new ending chapter, because I think it does the rest of the book a disservice. There is a lot of good ground covered in all the preceding chapters.<br/><br/>A Personal Note<br/>A note about my father. He had a doctorate in philosophy and this book was a summary of many of his interests coming together; I think it built on what he had written in his dissertation and expanded it. He was an odd man, far on the spectrum, mystical in his experiences of God, smarter than anyone I've ever met in the sense of analytic intelligence, dumber than almost anyone I've ever met in terms of understanding people. He married very late in life (37) and was divorced 13 years later. He lived a strange life full of adventures and living on pennies except towards the last third of his life when he got into actuarial science as a means of providing for his family. He had a fetish for growing home-grown corn and tomatoes, and he loved to play classical music on his upright piano. He died doing something he loved, which was bicycling on the country roads of Rutherford County, Tennessee. He had a PhD in philosophy and a master's in mathematics. He summited mountains, bicycled across the country twice, and traveled the world. He died alone.<br/><br/>I myself am an amateur student of philosophy, an interest that has grown considerably in recent years. I've read only a handful of modern philosophy books and was impressed with the lucidity that this particular book had (or rather, I was pleased that I was able to understand most of it). Suffice it to say that most of the works of philosophy that I have read so far are very old and this book was one of only a few exceptions.<br/><br/>My interests in philosophy are largely in the epistemic vein and I am essentially an empiricist at current time. I believe in truth as correspondence and am searching for it constantly in all realms of life, and I also have a mystical experience of God and personal experiences that I believe make me rationally justified in believing in his existence. I'm particularly interested in scientific thinking but also see the flaws with how it is often applied (or rather misapplied). Basically, this book hit all the right notes for me.<br/><br/>I was really surprised at the fact that my father had never discussed some of the major topics in this book with me. Based on the major topics of this book, one would expect that he had told me before about NDEs, the ideological aspects of the scientific community, and the undervaluing of anecdotal evidence. Actually, this is only true for the third topic; the first two he never discussed with me whatsoever.<br/><br/>I never got the chance to discuss my father's book with him. He died two and a half years ago. In other words, my philosophical views were formed absent of him. <br/><br/>Or were they? Even though we never discussed epistemology much, could it be that the worldview he taught me growing up influenced me to become the way I am? Or on the other hand could it be that there's something genetic to our philosophical leanings? I'll never know.<br/><br/>He never told me about NDEs. This flabbergasts me, as talk of the spiritual and philosophy was not uncommon between us. If he thought so highly of the evidence in favor of NDEs then why did he never tell me about that? Sadly I'll never know the answer to that, or to my other questions I have for him, at least not in this life. However, there's always the afterlife. Which, now thanks to this book, I have increased capacity to imagine being a real thing.<br/><br/>This book would be perfect for a philosopher in the branch of epistemology interested in exploring the possibility of rigorous religious explanations, or those interested in dissecting the value system of the scientific community and how that produces biases.`;

// Real bookshelf groupings from database
export const mockBookshelfGroupings: BookshelfGrouping[] = [
  {
    id: 7,
    name: "History",
    bookshelves: [
      { id: 202, name: "topical-history" },
      { id: 214, name: "ancient-history" },
      { id: 214, name: "renaissance-history" },
      { id: 227, name: "modern-history" }
    ]
  },
  {
    id: 8,
    name: "Science Fiction",
    bookshelves: [
      { id: 189, name: "sf-classics" },
      { id: 201, name: "space-opera" },
      { id: 203, name: "epic-sf" },
      { id: 204, name: "science-fiction-comps" },
      { id: 205, name: "cyberpunk" },
      { id: 206, name: "2024-science-fiction" }
    ]
  },
  {
    id: 9,
    name: "Fantasy",
    bookshelves: [
      { id: 207, name: "high-fantasy" },
      { id: 208, name: "modern-fantasy" },
      { id: 209, name: "modern-fairy-tales" },
      { id: 210, name: "folks-and-myths" }
    ]
  },
  {
    id: 10,
    name: "Ancient Classics",
    bookshelves: [
      { id: 211, name: "ancient-greek" },
      { id: 214, name: "ancient-history" },
      { id: 212, name: "ancient-classics" },
      { id: 213, name: "ancient-roman" }
    ]
  },
  {
    id: 11,
    name: "Classics",
    bookshelves: [
      { id: 211, name: "ancient-greek" },
      { id: 213, name: "ancient-roman" },
      { id: 215, name: "renaissance-classics" },
      { id: 216, name: "modern-classics" }
    ]
  }
]; 

export const mockBookReviews: BookReview[] = [
  {
    id: 1,
    title: "Final Eclipse",
    authorFirstName: "Matthew",
    authorLastName: "Huddleston",
    titleByAuthor: "Final Eclipse by Matthew Huddleston",
    myRating: 5,
    averageRating: 4.5,
    numberOfPages: 350,
    originalPublicationYear: null,
    dateRead: "2025-06-18 14:55:39.266458-07",
    myReview: finalEclipseReview,
    searchableString: "final eclipse matthew huddleston archway publishing epic sf friends sf sci fi science fiction",
    hasReviewContent: true,
    previewText: generatePreviewText(finalEclipseReview),
    readingTimeMinutes: calculateReadingTime(finalEclipseReview),
    coverImageId: null,
    bookshelves: [{ id: 203, name: "epic-sf" },{ id: 194, name: "friends" }],
    toneTags: ["gritty", "mystical", "bittersweet", "playful", "surreal", "heroic", "dramatic"]
  },
  {
    id: 2,
    title: "The Odyssey",
    authorFirstName: "Homer",
    authorLastName: "Homer",
    titleByAuthor: "The Odyssey by Homer",
    myRating: 4,
    averageRating: 4.2,
    numberOfPages: 400,
    originalPublicationYear: null,
    dateRead: "2025-06-18 14:55:39.253796-07",
    myReview: odysseyReview,
    searchableString: "the odyssey homer homer robert fagles, bernard knox penguin classics  history of lit ancient greek 2025 reading list ancient classics",
    hasReviewContent: true,
    previewText: generatePreviewText(odysseyReview),
    readingTimeMinutes: calculateReadingTime(odysseyReview),
    coverImageId: null,
    bookshelves: [{ id: 192, name: "2025-reading-list" }, { id: 191, name: "ancient-greek" }, { id: 225, name: "ancient-classics" },{ id: 190, name: "history-of-lit" }],
    toneTags: ["fast-paced", "grotesque", "hopeful", "sweet", "philosophical", "tragic", "romantic"]
  },
  {
    id: 3,
    title: "1984",
    authorFirstName: "George",
    authorLastName: "Orwell",
    titleByAuthor: "1984 by George Orwell",
    myRating: 5,
    averageRating: 4.2,
    numberOfPages: 298,
    originalPublicationYear: null,
    dateRead: "2025-06-17 14:55:39.253796-07",
    myReview: nineteenEightyFourReview,
    searchableString: "1984 george orwell signet classics dystopian fiction sf classics modern classics sf sci fi science fiction",
    hasReviewContent: true,
    previewText: generatePreviewText(nineteenEightyFourReview),
    readingTimeMinutes: calculateReadingTime(nineteenEightyFourReview),
    coverImageId: null,
    bookshelves: [{ id: 189, name: "sf-classics" },{ id: 212, name: "modern-classics" },],
    toneTags: ["melancholic", "haunting", "cozy", "hard-boiled", "dramatic", "suspenseful", "realistic"]
  },
  {
    id: 4,
    title: "Tenth of December",
    authorFirstName: "George",
    authorLastName: "Saunders",
    titleByAuthor: "Tenth of December by George Saunders",
    myRating: 4,
    averageRating: 4.1,
    numberOfPages: 250,
    originalPublicationYear: null,
    dateRead: "2025-06-16 14:55:39.253796-07",
    myReview: tenthOfDecemberReview,
    searchableString: "tenth of december george saunders random house short stories featured favorites modern literary fiction sf sci fi science fiction",
    hasReviewContent: true,
    previewText: generatePreviewText(tenthOfDecemberReview),
    readingTimeMinutes: calculateReadingTime(tenthOfDecemberReview),
    coverImageId: null,
    bookshelves: [{ id: 219, name: "featured" }, { id: 196, name: "favorites" },{ id: 221, name: "modern-literary-fiction" }, { id: 205, name: "cyberpunk" }],
    toneTags: ["dark", "futuristic", "surreal", "philosophical", "haunting", "melancholic", "hopeful"]
  },
  {
    id: 5,
    title: "King Arthur and the Knights of the Round Table (Great Illustrated Classics)",
    authorFirstName: "Joshua E.",
    authorLastName: "Hanft",
    titleByAuthor: "King Arthur and the Knights of the Round Table (Great Illustrated Classics) by Joshua E. Hanft",
    myRating: 3,
    averageRating: 3.8,
    numberOfPages: 200,
    originalPublicationYear: null,
    dateRead: "2025-06-15 14:55:39.253796-07",
    myReview: kingArthurReview,
    searchableString: "king arthur and the knights of the round table joshua e hanft abdo publishing arthurian legends childrens",
    hasReviewContent: true,
    previewText: generatePreviewText(kingArthurReview),
    readingTimeMinutes: calculateReadingTime(kingArthurReview),
    coverImageId: null,
    bookshelves: [{ id: 228, name: "childrens" },],
    toneTags: ["angsty", "uplifting", "macabre", "epic", "psychological", "romantic", "poignant"]
  },
  {
    id: 6,
    title: "Don't You Just Hate That?",
    authorFirstName: "Scott",
    authorLastName: "Cohen",
    titleByAuthor: "Don't You Just Hate That? by Scott Cohen",
    myRating: 3,
    averageRating: 3.5,
    numberOfPages: 180,
    originalPublicationYear: null,
    dateRead: "2025-06-14 14:55:39.253796-07",
    myReview: dontYouJustHateThatReview,
    searchableString: "don't you just hate that? scott cohen workman publishing humor",
    hasReviewContent: true,
    previewText: generatePreviewText(dontYouJustHateThatReview),
    readingTimeMinutes: calculateReadingTime(dontYouJustHateThatReview),
    coverImageId: null,
    bookshelves: [],
    toneTags: ["flirty", "bleak", "detached", "steamy", "intense", "whimsical", "dark"]
  },
  {
    id: 2159,
    title: "The Left Hand of Darkness: BBC Radio 4 Full-Cast Dramatisation",
    authorFirstName: "Ursula K. Le",
    authorLastName: "Guin",
    titleByAuthor: "The Left Hand of Darkness: BBC Radio 4 Full-Cast Dramatisation by Ursula K. Le Guin",
    myRating: 4,
    averageRating: 3.49,
    numberOfPages: 2,
    originalPublicationYear: null,
    dateRead: "2025-06-18 21:55:39.315251+00:00",
    myReview: thelefthandofdarknessReview,
    searchableString: "the left hand of darkness: bbc radio 4 full cast dramatisation ursula k. le guin bbc worldwide ltd. modern classics sf classics  sf sci fi science fiction",
    hasReviewContent: true,
    previewText: generatePreviewText(thelefthandofdarknessReview),
    readingTimeMinutes: calculateReadingTime(thelefthandofdarknessReview),
    coverImageId: null,
    bookshelves: [{ id: 212, name: "modern-classics" },{ id: 189, name: "sf-classics" }],
    toneTags: ["dark", "lyrical", "tragic", "playful", "gritty", "romantic", "intense"]
  },
  {
    id: 2138,
    title: "The Lord of the Rings",
    authorFirstName: "J.R.R.",
    authorLastName: "Tolkien",
    titleByAuthor: "The Lord of the Rings by J.R.R. Tolkien",
    myRating: 5,
    averageRating: 4.54,
    numberOfPages: 1216,
    originalPublicationYear: 1954,
    dateRead: "2025-06-18 21:55:39.314736+00:00",
    myReview: thelordoftheringsReview,
    searchableString: "the lord of the rings j.r.r. tolkien houghton mifflin harcourt favorites featured high fantasy modern classics",
    hasReviewContent: true,
    previewText: generatePreviewText(thelordoftheringsReview),
    readingTimeMinutes: calculateReadingTime(thelordoftheringsReview),
    coverImageId: 54,
    bookshelves: [{ id: 196, name: "favorites" }, { id: 219, name: "featured" },{ id: 211, name: "high-fantasy" },{ id: 212, name: "modern-classics" },],
    toneTags: ["suspenseful", "mystical", "tragic", "claustrophobic", "sweet", "disturbing", "atmospheric"]
  },
  {
    id: 2061,
    title: "Twelve Steps and Twelve Traditions",
    authorFirstName: "Alcoholics",
    authorLastName: "Anonymous",
    titleByAuthor: "Twelve Steps and Twelve Traditions by Alcoholics Anonymous",
    myRating: 5,
    averageRating: 4.51,
    numberOfPages: 192,
    originalPublicationYear: 1952,
    dateRead: "2025-06-18 21:55:39.312407+00:00",
    myReview: twelvestepsandtwelvetraditionsReview,
    searchableString: "twelve steps and twelve traditions alcoholics anonymous alcoholics anonymous world services favorites psychology spirituality-and-theology",
    hasReviewContent: true,
    previewText: generatePreviewText(twelvestepsandtwelvetraditionsReview),
    readingTimeMinutes: calculateReadingTime(twelvestepsandtwelvetraditionsReview),
    coverImageId: 50,
    bookshelves: [{ id: 196, name: "favorites" },{ id: 213, name: "psychology" },{ id: 218, name: "spirituality and theology" },]
  },
  {
    id: 1948,
    title: "Assassin's Apprentice (Farseer Trilogy, #1)",
    authorFirstName: "Robin",
    authorLastName: "Hobb",
    titleByAuthor: "Assassin's Apprentice (Farseer Trilogy, #1) by Robin Hobb",
    myRating: 5,
    averageRating: 4.19,
    numberOfPages: 435,
    originalPublicationYear: 1995,
    dateRead: "2025-06-18 21:55:39.268388+00:00",
    myReview: assassinsapprenticeReview,
    searchableString: "assassin's apprentice (farseer trilogy, #1) robin hobb spectra books favorites high fantasy",
    hasReviewContent: true,
    previewText: generatePreviewText(assassinsapprenticeReview),
    readingTimeMinutes: calculateReadingTime(assassinsapprenticeReview),
    coverImageId: 55,
    bookshelves: [{ id: 196, name: "favorites" }, { id: 211, name: "high-fantasy" }],
    toneTags: ["dramatic", "macabre", "heroic", "cynical", "cozy", "uplifting", "dark"]
  },
  {
    id: 1885,
    title: "Frog and Toad Are Friends (Frog and Toad, #1)",
    authorFirstName: "Arnold",
    authorLastName: "Lobel",
    titleByAuthor: "Frog and Toad Are Friends (Frog and Toad, #1) by Arnold Lobel",
    myRating: 5,
    averageRating: 4.25,
    numberOfPages: 64,
    originalPublicationYear: 1970,
    dateRead: "2025-05-26 00:00:00.000000+00:00",
    myReview: frogandtoadarefriendsReview,
    searchableString: "frog and toad are friends (frog and toad, #1) arnold lobel harpercollins favorites childrens",
    hasReviewContent: true,
    previewText: generatePreviewText(frogandtoadarefriendsReview),
    readingTimeMinutes: calculateReadingTime(frogandtoadarefriendsReview),
    coverImageId: 61,
    bookshelves: [{ id: 196, name: "favorites" }, { id: 228, name: "childrens" },],
    toneTags: ["surreal", "grotesque", "psychological", "bleak", "hopeful", "atmospheric"]
  },
  {
    id: 1884,
    title: "Religious Explanation and Scientific Ideology (Toronto Studies in Religion)",
    authorFirstName: "Jesse",
    authorLastName: "Hobbs",
    titleByAuthor: "Religious Explanation and Scientific Ideology (Toronto Studies in Religion) by Jesse Hobbs",
    myRating: 4,
    averageRating: 4.00,
    numberOfPages: 234,
    originalPublicationYear: 1994,
    dateRead: "2025-05-03 00:00:00.000000+00:00",
    myReview: religiousexplanationandscientificideologyReview,
    searchableString: "religious explanation and scientific ideology (toronto studies in religion) jesse hobbs peter lang inc., international academic publishers friends philosophy 2025 reading list theology and spirituality",
    hasReviewContent: true,
    previewText: generatePreviewText(religiousexplanationandscientificideologyReview),
    readingTimeMinutes: calculateReadingTime(religiousexplanationandscientificideologyReview),
    coverImageId: null,
    bookshelves: [{ id: 192, name: "2025-reading-list" }, { id: 194, name: "friends" }, { id: 195, name: "philosophy" }, { id: 218, name: "theology-and-spirituality" },]  
  }
]; 

// Real bookshelves from database
export const mockBookshelves: Bookshelf[] = [
  { id: 196, name: "favorites" },
  { id: 219, name: "featured" },
  { id: 192, name: "2025-reading-list" },
  { id: 191, name: "ancient-greek" },
  { id: 190, name: "history-of-lit" },
  { id: 211, name: "high-fantasy" },
  { id: 195, name: "philosophy" },
  { id: 194, name: "friends" },
  { id: 228, name: "childrens" }
];

// Re-export utility functions for convenience
export { generatePreviewText, calculateReadingTime };

// Re-export tone taxonomy for convenience
export { toneTaxonomy } from './mockToneTaxonomyData';

