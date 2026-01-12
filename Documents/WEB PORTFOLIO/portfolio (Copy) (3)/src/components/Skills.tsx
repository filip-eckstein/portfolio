import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function Skills() {
  const skillCategories = [
    {
      title: "CAD Software",
      skills: [
        "SolidWorks",
        "AutoCAD",
        "Fusion 360",
        "Inventor",
        "CATIA",
        "Rhino",
        "SketchUp",
        "FreeCAD",
      ],
    },
    {
      title: "3D Printing & Manufacturing",
      skills: [
        "FDM Printing",
        "SLA/Resin Printing",
        "Slicing Software",
        "Print Optimization",
        "Material Selection",
        "Post-Processing",
        "CNC Basics",
        "Prototyping",
      ],
    },
    {
      title: "Design & Analysis",
      skills: [
        "Technical Drawing",
        "3D Modeling",
        "Assembly Design",
        "Parametric Design",
        "Surface Modeling",
        "FEA Analysis",
        "Rendering",
        "Product Design",
      ],
    },
  ];

  return (
    <section id="skills" className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center mb-4 text-foreground">Skills & Expertise</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Comprehensive knowledge of CAD software, 3D printing technologies, and design methodologies.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {skillCategories.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}