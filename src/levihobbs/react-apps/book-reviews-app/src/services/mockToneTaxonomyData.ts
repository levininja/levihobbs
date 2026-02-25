import type { Tone } from '../types/BookReviewTypes';

// Tone taxonomy data
export const toneTaxonomy: Tone[] = [
    {
        id: 1,
        name: "Poignant",
        description: "Evokes a deep emotional response — beauty, sadness, longing, or emotional catharsis.",
        subtones: [
            {
                id: 101,
                name: "Melancholic",
                description: "Wistful sadness, emotional heaviness"
            },
            {
                id: 102,
                name: "Bittersweet",
                description: "Happy-sad blend; joy tinged with sorrow"
            },
            {
                id: 103,
                name: "Gut-wrenching",
                description: "Overwhelming grief, devastation, or emotional agony"
            },
            {
                id: 104,
                name: "Heartwarming",
                description: "Deeply joyful, comforting, emotionally uplifting"
            },
            {
                id: 105,
                name: "Haunting",
                description: "Emotionally lingering; either mournful or eerie"
            }
        ]
    },
    {
        id: 2,
        name: "Dark",
        description: "Bleak, grim, disturbing, negative emotional or thematic tone.",
        subtones: [
            {
                id: 201,
                name: "Bleak",
                description: "Hopeless, emotionally barren, devoid of comfort"
            },
            {
                id: 202,
                name: "Gritty",
                description: "Harsh realism; physical or moral ugliness"
            },
            {
                id: 203,
                name: "Cynical",
                description: "Distrustful of humanity, institutions, or motives"
            },
            {
                id: 204,
                name: "Macabre",
                description: "Focused on death, decay, and mortality"
            },
            {
                id: 205,
                name: "Grotesque",
                description: "Distorted, deformed, or unsettling in physical, thematic, or psychological ways"
            },
            {
                id: 206,
                name: "Disturbing",
                description: "Provokes discomfort or dread; often through horror, depravity, or existential tension"
            },
            {
                id: 207,
                name: "Unsettling",
                description: "Subtly discomforting; leaves the reader emotionally off balance"
            },
            {
                id: 208,
                name: "Claustrophobic",
                description: "Oppressive, trapped, suffocating, whether emotionally or physically"
            },
            {
                id: 209,
                name: "Hard-boiled",
                description: "Cynical, terse, emotionally detached tone, often in crime or noir fiction"
            },
            {
                id: 210,
                name: "Grimdark",
                description: "A form of dark fiction that is bleak, gritty, cynical, and devoid of moral clarity"
            }
        ]
    },
    {
        id: 3,
        name: "Intense",
        description: "High emotional pressure, tension, or stress — internal or external.",
        subtones: [
            {
                id: 301,
                name: "Suspenseful",
                description: "Driven by tension, uncertainty, and anticipation"
            }
        ]
    },
    {
        id: 4,
        name: "Atmospheric",
        description: "Immersive mood and sensory presence.",
        subtones: [
            {
                id: 401,
                name: "Lyrical",
                description: "Beautiful, poetic, stylized language that drives the emotional tone"
            },
            {
                id: 402,
                name: "Surreal",
                description: "Dreamlike, bizarre, reality-bending tone"
            },
            {
                id: 403,
                name: "Mystical",
                description: "Numinous, transcendent, spiritual, or magical in tone"
            }
        ]
    },
    {
        id: 5,
        name: "Dramatic",
        description: "High emotional stakes, emotional display, conflict, and heightened energy.",
        subtones: [
            {
                id: 501,
                name: "Heroic",
                description: "Dramatization of courage, valor, sacrifice, grand quests"
            },
            {
                id: 502,
                name: "Tragic",
                description: "Dramatization of downfall, loss, failure, sorrow"
            }
        ]
    },
    {
        id: 6,
        name: "Romantic",
        description: "Focused on love, passion, and relationship-driven emotional tone.",
        subtones: [
            {
                id: 601,
                name: "Steamy",
                description: "Erotic, sensual, sexually charged tone"
            },
            {
                id: 602,
                name: "Sweet",
                description: "Wholesome, tender, gentle, and emotionally innocent romance"
            },
            {
                id: 603,
                name: "Angsty",
                description: "Emotional turmoil, yearning, heartbreak, tension before resolution"
            },
            {
                id: 604,
                name: "Flirty",
                description: "Playful, teasing, often lighthearted romantic tension"
            }
        ]
    },
    {
        id: 7,
        name: "Hopeful",
        description: "Oriented toward optimism, progress, or the possibility of good outcomes.",
        subtones: [
            {
                id: 701,
                name: "Uplifting",
                description: "Specifically designed to make the reader feel joyful, encouraged, or inspired"
            }
        ]
    },
    {
        id: 8,
        name: "Realistic",
        description: "Grounded in plausibility, the mundane, the ordinary; downplays melodrama or artifice.",
        subtones: [
            {
                id: 801,
                name: "Detached",
                description: "Emotionally neutral, clinical, observational; understated affect within realism"
            }
        ]
    },
    {
        id: 9,
        name: "Playful",
        description: "Light, humorous, self-aware, witty, or tongue-in-cheek tone."
    },
    {
        id: 10,
        name: "Whimsical",
        description: "Fanciful, quirky, imaginative, often magical or surreal but lighthearted."
    },
    {
        id: 11,
        name: "Cozy",
        description: "Safe, comforting, low-stress, emotionally gentle."
    },
    {
        id: 12,
        name: "Philosophical",
        description: "Focused on intellectual or existential exploration; abstract or contemplative."
    },
    {
        id: 13,
        name: "Psychological",
        description: "Focused on internal tension, mind games, emotional instability, or mental complexity."
    },
    {
        id: 14,
        name: "Epic",
        description: "Grand in scope, high-stakes, large-scale storytelling."
    }
];
