namespace levihobbs.Models
{
    // This is a grouping of tones for the purpose of making the tone assignment admin page easier to use; each grouping of tones
    // has a different color and is displayed in a different column on the tone assignment page.
    // These groupings do not have much true meaning outside of simply being a convenient way for admins to be able to build a 
    // mental model of where all the tones are at a glance because a given tone is always located in the same place with the same
    // color. Since the tone color groupings have no meaning outside of that context, this data isn't set in the database and 
    // doesn't exist as far as the API is concerned.
    public class ToneColorGrouping
    {
        public string Name { get; set; } = "";
        public string DisplayName { get; set; } = "";
        public string ColorClass { get; set; } = "";
        public List<Tone> Tones { get; set; } = new List<Tone>();
    }
}