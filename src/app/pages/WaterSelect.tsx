import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Waves, MapPin, ChevronRight } from 'lucide-react';
import { RoleIndicator } from '../components/RoleIndicator';
import { waters, species as allSpecies } from '../data/world';
import { useDemo } from '../context/DemoContext';

export default function WaterSelect() {
  const { surveys } = useDemo();
  const neWaters = waters.filter(w => w.region === 'Northeast');

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border px-8 py-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-primary">Select Water Body</p>
              <p className="text-[13px] text-muted-foreground mt-1">
                Choose a water to view survey history and status
              </p>
            </div>
            <RoleIndicator />
          </div>
        </div>
      </header>

      {/* Regional Scope Strip */}
      <div className="bg-muted/20 border-b border-border px-8 py-3">
        <div className="max-w-[1280px] mx-auto">
          <p className="text-[12px] text-muted-foreground">
            <span className="font-medium text-foreground">Regional Scope Active</span> — Northeast Basin
          </p>
        </div>
      </div>

      <div className="px-8 py-8">
        <div className="max-w-[1280px] mx-auto">
          <Card className="border border-border">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-[16px]">Waters in Northeast Region</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="divide-y divide-border/50">
                {neWaters.map((water) => {
                  const waterSurveys = surveys.filter(s => s.waterId === water.id);
                  const speciesNames = water.primarySpecies
                    .map(code => allSpecies.find(s => s.code === code)?.common ?? code)
                    .join(', ');

                  return (
                    <Link
                      key={water.id}
                      to={`/water/profile?waterId=${water.id}`}
                      className="flex items-center justify-between py-4 px-4 -mx-2 rounded"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Waves className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-[14px] font-medium text-foreground">{water.name}</p>
                          <p className="text-[12px] text-muted-foreground mt-0.5">
                            {speciesNames}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[13px] font-medium text-foreground">{waterSurveys.length}</p>
                          <p className="text-[11px] text-muted-foreground">surveys</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {water.stations.length} station{water.stations.length !== 1 ? 's' : ''}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {water.yearsActive.start}–{water.yearsActive.end}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
