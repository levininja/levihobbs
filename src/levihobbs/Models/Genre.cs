using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace levihobbs.Models
{
    public class Genre
    {
        [Key]
        public string Name { get; set; }
        public int SortOrder { get; set; }
        public string ParentName { get; set; }
    }
}
