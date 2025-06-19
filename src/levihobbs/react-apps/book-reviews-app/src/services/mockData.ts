import type { BookReview, Bookshelf, BookshelfGrouping } from '../types/BookReview';

// Real bookshelves from database
export const mockBookshelves: Bookshelf[] = [
  { id: 196, name: "favorites", displayName: "favorites" },
  { id: 219, name: "featured", displayName: "featured" },
  { id: 192, name: "2025-reading-list", displayName: "2025-reading-list" },
  { id: 191, name: "ancient-greek", displayName: "ancient-greek" },
  { id: 190, name: "history-of-lit", displayName: "history-of-lit" },
  { id: 211, name: "high-fantasy", displayName: "high-fantasy" },
  { id: 195, name: "philosophy", displayName: "philosophy" },
  { id: 194, name: "friends", displayName: "friends" },
  { id: 228, name: "childrens", displayName: "childrens" }
];

// Mock bookshelf groupings (empty for now since database has none)
export const mockBookshelfGroupings: BookshelfGrouping[] = [];

// Helper function to calculate reading time
const calculateReadingTime = (review: string): number => {
  const words = review.split(/\s+/).length;
  return Math.round(words / 250);
};

// Helper function to generate preview text
const generatePreviewText = (review: string): string => {
  // Remove HTML tags and get first 300 characters
  const cleanText = review.replace(/<[^>]*>/g, '');
  return cleanText.length > 300 ? cleanText.substring(0, 300) + '...' : cleanText;
};

// Real book reviews from database with generated fields
export const mockBookReviews: BookReview[] = [
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
    dateRead: "2025-06-18T14:55:39.315251-07:00",
    myReview: "This didn't have the full story of the full book, so it's hard to give it five stars for that reason...there's as lot missing. However, it worked for me as a kind of way to have a \"remix\" of the original book, an alternate way of experiencing it if you've already experienced it. The production quality was top notch with great sound effects and voicing. Hearing the whistling of the wind alone was enough to add substantially to the empty feeling of this book.",
    searchableString: "the left hand of darkness: bbc radio 4 full-cast dramatisation ursula k. le guin bbc worldwide ltd.",
    hasReviewContent: true,
    previewText: generatePreviewText("This didn't have the full story of the full book, so it's hard to give it five stars for that reason...there's as lot missing. However, it worked for me as a kind of way to have a \"remix\" of the original book, an alternate way of experiencing it if you've already experienced it. The production quality was top notch with great sound effects and voicing. Hearing the whistling of the wind alone was enough to add substantially to the empty feeling of this book."),
    readingTimeMinutes: calculateReadingTime("This didn't have the full story of the full book, so it's hard to give it five stars for that reason...there's as lot missing. However, it worked for me as a kind of way to have a \"remix\" of the original book, an alternate way of experiencing it if you've already experienced it. The production quality was top notch with great sound effects and voicing. Hearing the whistling of the wind alone was enough to add substantially to the empty feeling of this book."),
    coverImageId: null,
    bookshelves: []
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
    dateRead: "2025-06-18T14:55:39.314736-07:00",
    myReview: "It was a joy to read this again after many years. I don't want to go this long between readings next time. From the moment I started reading the prologue, this was so good. It's so refreshing after the years of reading many other things, many of which are mediocre, some downright bad, to come back to something I know is amazing. Right from the moment that I started reading Tolkien's forward on details about hobbits, their three races, etc, I knew I was home.<br/><br/>One of the best things about Tolkien is his voice. It's grandfatherly, very positive, very reassuring. Another thing, of course, is his worldbuilding. The languages you're exposed to, the poems (which are actually good, unlike most fantasy authors who have tried to pull this off), the appendices...in no other text have I enjoyed reading appendices so much. And the historical footnotes, wow. Those really give it a level of verisimilitude that is really endearing.",
    searchableString: "the lord of the rings j.r.r. tolkien houghton mifflin harcourt favorites featured",
    hasReviewContent: true,
    previewText: generatePreviewText("It was a joy to read this again after many years. I don't want to go this long between readings next time. From the moment I started reading the prologue, this was so good. It's so refreshing after the years of reading many other things, many of which are mediocre, some downright bad, to come back to something I know is amazing. Right from the moment that I started reading Tolkien's forward on details about hobbits, their three races, etc, I knew I was home."),
    readingTimeMinutes: calculateReadingTime("It was a joy to read this again after many years. I don't want to go this long between readings next time. From the moment I started reading the prologue, this was so good. It's so refreshing after the years of reading many other things, many of which are mediocre, some downright bad, to come back to something I know is amazing. Right from the moment that I started reading Tolkien's forward on details about hobbits, their three races, etc, I knew I was home."),
    coverImageId: null,
    bookshelves: [
      { id: 196, name: "favorites", displayName: "favorites" },
      { id: 219, name: "featured", displayName: "featured" }
    ]
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
    dateRead: "2025-06-18T14:55:39.312407-07:00",
    myReview: "I consider this the most foundational text for working the steps. The Big Book is powerful, but it was written while the founders of AA were still trying to get sober and it would be hard to argue that it has no flaws. The 12x12, on the other hand, I have found to be very thorough on every step and provide deep insights on each one.",
    searchableString: "twelve steps and twelve traditions alcoholics anonymous alcoholics anonymous world services favorites",
    hasReviewContent: true,
    previewText: generatePreviewText("I consider this the most foundational text for working the steps. The Big Book is powerful, but it was written while the founders of AA were still trying to get sober and it would be hard to argue that it has no flaws. The 12x12, on the other hand, I have found to be very thorough on every step and provide deep insights on each one."),
    readingTimeMinutes: calculateReadingTime("I consider this the most foundational text for working the steps. The Big Book is powerful, but it was written while the founders of AA were still trying to get sober and it would be hard to argue that it has no flaws. The 12x12, on the other hand, I have found to be very thorough on every step and provide deep insights on each one."),
    coverImageId: null,
    bookshelves: [
      { id: 196, name: "favorites", displayName: "favorites" }
    ]
  },
  {
    id: 1995,
    title: "1984",
    authorFirstName: "George",
    authorLastName: "Orwell",
    titleByAuthor: "1984 by George Orwell",
    myRating: 5,
    averageRating: 4.20,
    numberOfPages: 298,
    originalPublicationYear: null,
    dateRead: "2025-06-18T14:55:39.302708-07:00",
    myReview: "An unforgettable classic of the dystopian genre, it's still unparalleled in its deep satire of totalitarian states and their systems of propaganda, by which they change the language itself to the point of absurdity, where everything's true meaning is the opposite of its name: the Ministry of Love is where you go to get tortured; the Ministry of Truth is where they fabricate lies (propaganda); and so forth. These patterns have been played out the world over, again and again, in so many countries and political parties.",
    searchableString: "1984 george orwell houghton mifflin harcourt",
    hasReviewContent: true,
    previewText: generatePreviewText("An unforgettable classic of the dystopian genre, it's still unparalleled in its deep satire of totalitarian states and their systems of propaganda, by which they change the language itself to the point of absurdity, where everything's true meaning is the opposite of its name: the Ministry of Love is where you go to get tortured; the Ministry of Truth is where they fabricate lies (propaganda); and so forth. These patterns have been played out the world over, again and again, in so many countries and political parties."),
    readingTimeMinutes: calculateReadingTime("An unforgettable classic of the dystopian genre, it's still unparalleled in its deep satire of totalitarian states and their systems of propaganda, by which they change the language itself to the point of absurdity, where everything's true meaning is the opposite of its name: the Ministry of Love is where you go to get tortured; the Ministry of Truth is where they fabricate lies (propaganda); and so forth. These patterns have been played out the world over, again and again, in so many countries and political parties."),
    coverImageId: null,
    bookshelves: []
  },
  {
    id: 1983,
    title: "Tenth of December",
    authorFirstName: "George",
    authorLastName: "Saunders",
    titleByAuthor: "Tenth of December by George Saunders",
    myRating: 5,
    averageRating: 3.98,
    numberOfPages: 251,
    originalPublicationYear: 2013,
    dateRead: "2025-06-18T14:55:39.300035-07:00",
    myReview: "Tenth of December is my favorite short story collection, or tied for favorite with Flanner O'Connor's Complete Short Stories, if I'm allowed to cheat. The two collections couldn't have settings that are more different...Saunders' stories have modern settings and sometimes mix in mysterious science fiction, and he has a fetish for bizarre amusement parks. O'Connor, on the other hand, wrote gothic (creepy, horror-esque) stories about Southern people in the 50s.",
    searchableString: "tenth of december george saunders random house favorites featured",
    hasReviewContent: true,
    previewText: generatePreviewText("Tenth of December is my favorite short story collection, or tied for favorite with Flanner O'Connor's Complete Short Stories, if I'm allowed to cheat. The two collections couldn't have settings that are more different...Saunders' stories have modern settings and sometimes mix in mysterious science fiction, and he has a fetish for bizarre amusement parks. O'Connor, on the other hand, wrote gothic (creepy, horror-esque) stories about Southern people in the 50s."),
    readingTimeMinutes: calculateReadingTime("Tenth of December is my favorite short story collection, or tied for favorite with Flanner O'Connor's Complete Short Stories, if I'm allowed to cheat. The two collections couldn't have settings that are more different...Saunders' stories have modern settings and sometimes mix in mysterious science fiction, and he has a fetish for bizarre amusement parks. O'Connor, on the other hand, wrote gothic (creepy, horror-esque) stories about Southern people in the 50s."),
    coverImageId: null,
    bookshelves: [
      { id: 196, name: "favorites", displayName: "favorites" },
      { id: 219, name: "featured", displayName: "featured" }
    ]
  },
  {
    id: 1981,
    title: "King Arthur and the Knights of the Round Table (Great Illustrated Classics)",
    authorFirstName: "Joshua E.",
    authorLastName: "Hanft",
    titleByAuthor: "King Arthur and the Knights of the Round Table (Great Illustrated Classics) by Joshua E. Hanft",
    myRating: 5,
    averageRating: 3.96,
    numberOfPages: 238,
    originalPublicationYear: 1903,
    dateRead: "2025-06-18T14:55:39.299986-07:00",
    myReview: "This book was perhaps the most important in my journey of falling in love with reading as a small child.",
    searchableString: "king arthur and the knights of the round table (great illustrated classics) joshua e. hanft howard pyle, pablo marcos baronet books",
    hasReviewContent: true,
    previewText: generatePreviewText("This book was perhaps the most important in my journey of falling in love with reading as a small child."),
    readingTimeMinutes: calculateReadingTime("This book was perhaps the most important in my journey of falling in love with reading as a small child."),
    coverImageId: null,
    bookshelves: [
      { id: 228, name: "childrens", displayName: "childrens" }
    ]
  },
  {
    id: 1975,
    title: "Don't You Just Hate That?: 738 Annoying Things",
    authorFirstName: "Scott",
    authorLastName: "Cohen",
    titleByAuthor: "Don't You Just Hate That?: 738 Annoying Things by Scott Cohen",
    myRating: 4,
    averageRating: 3.90,
    numberOfPages: 407,
    originalPublicationYear: 2004,
    dateRead: "2025-06-18T14:55:39.299664-07:00",
    myReview: "Really funny as a bathroom book, just sitting there for you to crack open while plumbing the depths of your toilet. Read a couple pages and get a few laughs in, but don't read the whole thing in one sitting or it will get old; also you'll lose feeling in your legs and have that awful pins and needles effect when you stand up.",
    searchableString: "don't you just hate that?: 738 annoying things scott cohen workman publishing company",
    hasReviewContent: true,
    previewText: generatePreviewText("Really funny as a bathroom book, just sitting there for you to crack open while plumbing the depths of your toilet. Read a couple pages and get a few laughs in, but don't read the whole thing in one sitting or it will get old; also you'll lose feeling in your legs and have that awful pins and needles effect when you stand up."),
    readingTimeMinutes: calculateReadingTime("Really funny as a bathroom book, just sitting there for you to crack open while plumbing the depths of your toilet. Read a couple pages and get a few laughs in, but don't read the whole thing in one sitting or it will get old; also you'll lose feeling in your legs and have that awful pins and needles effect when you stand up."),
    coverImageId: null,
    bookshelves: []
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
    dateRead: "2025-06-18T14:55:39.268388-07:00",
    myReview: "This was my second read, and it was wonderful to notice all sorts of foreshadowings and other details that I didn't know to attach significance to the first time around, in addition to all of the other things that Robin Hobb does so well. Still one of my favorite fantasy novels. Looking forward to now reading the sequel a second time; I liked it even more.",
    searchableString: "assassin's apprentice (farseer trilogy, #1) robin hobb spectra books favorites high fantasy",
    hasReviewContent: true,
    previewText: generatePreviewText("This was my second read, and it was wonderful to notice all sorts of foreshadowings and other details that I didn't know to attach significance to the first time around, in addition to all of the other things that Robin Hobb does so well. Still one of my favorite fantasy novels. Looking forward to now reading the sequel a second time; I liked it even more."),
    readingTimeMinutes: calculateReadingTime("This was my second read, and it was wonderful to notice all sorts of foreshadowings and other details that I didn't know to attach significance to the first time around, in addition to all of the other things that Robin Hobb does so well. Still one of my favorite fantasy novels. Looking forward to now reading the sequel a second time; I liked it even more."),
    coverImageId: null,
    bookshelves: [
      { id: 196, name: "favorites", displayName: "favorites" },
      { id: 211, name: "high-fantasy", displayName: "high-fantasy" }
    ]
  },
  {
    id: 1927,
    title: "Final Eclipse",
    authorFirstName: "Matthew",
    authorLastName: "Huddleston",
    titleByAuthor: "Final Eclipse by Matthew Huddleston",
    myRating: 5,
    averageRating: 5.00,
    numberOfPages: 292,
    originalPublicationYear: null,
    dateRead: "2025-06-18T14:55:39.266458-07:00",
    myReview: "It is so rare to read science fiction these days that both inspires the imagination and also teaches real science. This last week I reviewed Three Body Problem, which I raved about because it does just that. Final Eclipse is another of the few. It has a small group of friends using deduction and science to battle against a conspiracy of unseen, sinister extraterrestrials who are hell-bent on conquering the planet.",
    searchableString: "final eclipse matthew huddleston archway publishing",
    hasReviewContent: true,
    previewText: generatePreviewText("It is so rare to read science fiction these days that both inspires the imagination and also teaches real science. This last week I reviewed Three Body Problem, which I raved about because it does just that. Final Eclipse is another of the few. It has a small group of friends using deduction and science to battle against a conspiracy of unseen, sinister extraterrestrials who are hell-bent on conquering the planet."),
    readingTimeMinutes: calculateReadingTime("It is so rare to read science fiction these days that both inspires the imagination and also teaches real science. This last week I reviewed Three Body Problem, which I raved about because it does just that. Final Eclipse is another of the few. It has a small group of friends using deduction and science to battle against a conspiracy of unseen, sinister extraterrestrials who are hell-bent on conquering the planet."),
    coverImageId: null,
    bookshelves: []
  },
  {
    id: 1882,
    title: "The Odyssey",
    authorFirstName: "Homer",
    authorLastName: "Homer",
    titleByAuthor: "The Odyssey by Homer Homer",
    myRating: 4,
    averageRating: 3.82,
    numberOfPages: 541,
    originalPublicationYear: null,
    dateRead: "2025-06-18T14:55:39.253796-07:00",
    myReview: "I read Samuel Butler's translation, originally published in 1900, which is recommended if you're looking for a prose translation that retains some of the poetic language. I considered the older language that Butler uses to be fitting to me for reading something this ancient. One of the fascinating things about Samuel Butler's translation is that it includes a preface, written by him, where he explains that he had published a book called \"The Authoress of the Odyssey\" in which he claimed that the author of the Odyssey was not in fact Homer (which wasn't so provocative an idea at the time), but was in fact a woman (which was).",
    searchableString: "the odyssey homer homer robert fagles, bernard knox penguin classics history of lit ancient greek 2025 reading list",
    hasReviewContent: true,
    previewText: generatePreviewText("I read Samuel Butler's translation, originally published in 1900, which is recommended if you're looking for a prose translation that retains some of the poetic language. I considered the older language that Butler uses to be fitting to me for reading something this ancient. One of the fascinating things about Samuel Butler's translation is that it includes a preface, written by him, where he explains that he had published a book called \"The Authoress of the Odyssey\" in which he claimed that the author of the Odyssey was not in fact Homer (which wasn't so provocative an idea at the time), but was in fact a woman (which was)."),
    readingTimeMinutes: calculateReadingTime("I read Samuel Butler's translation, originally published in 1900, which is recommended if you're looking for a prose translation that retains some of the poetic language. I considered the older language that Butler uses to be fitting to me for reading something this ancient. One of the fascinating things about Samuel Butler's translation is that it includes a preface, written by him, where he explains that he had published a book called \"The Authoress of the Odyssey\" in which he claimed that the author of the Odyssey was not in fact Homer (which wasn't so provocative an idea at the time), but was in fact a woman (which was)."),
    coverImageId: null,
    bookshelves: [
      { id: 190, name: "history-of-lit", displayName: "history-of-lit" },
      { id: 191, name: "ancient-greek", displayName: "ancient-greek" },
      { id: 192, name: "2025-reading-list", displayName: "2025-reading-list" }
    ]
  }
]; 