/**
 * mlbPlayers.ts — Centralized MLB Players Dataset
 * All active MLB players for 2025/2026 season.
 * Used by all pages for player filtering, search, and selection.
 */

export interface MLBPlayer {
  id: string;
  name: string;
  team: string;
  teamFull: string;
  position: string;
  bats: 'L' | 'R' | 'S';
  throws: 'L' | 'R';
  number: string;
  type: 'batter' | 'pitcher' | 'two-way';
}

export const MLB_TEAM_FULL_NAMES: Record<string, string> = {
  ARI: 'Arizona Diamondbacks',
  ATL: 'Atlanta Braves',
  BAL: 'Baltimore Orioles',
  BOS: 'Boston Red Sox',
  CHC: 'Chicago Cubs',
  CWS: 'Chicago White Sox',
  CIN: 'Cincinnati Reds',
  CLE: 'Cleveland Guardians',
  COL: 'Colorado Rockies',
  DET: 'Detroit Tigers',
  HOU: 'Houston Astros',
  KC: 'Kansas City Royals',
  LAA: 'Los Angeles Angels',
  LAD: 'Los Angeles Dodgers',
  MIA: 'Miami Marlins',
  MIL: 'Milwaukee Brewers',
  MIN: 'Minnesota Twins',
  NYM: 'New York Mets',
  NYY: 'New York Yankees',
  OAK: 'Oakland Athletics',
  PHI: 'Philadelphia Phillies',
  PIT: 'Pittsburgh Pirates',
  SD: 'San Diego Padres',
  SF: 'San Francisco Giants',
  SEA: 'Seattle Mariners',
  STL: 'St. Louis Cardinals',
  TB: 'Tampa Bay Rays',
  TEX: 'Texas Rangers',
  TOR: 'Toronto Blue Jays',
  WSH: 'Washington Nationals',
};

export const ALL_MLB_PLAYERS: MLBPlayer[] = [
  // NYY
  { id: 'p-aaron-judge', name: 'Aaron Judge', team: 'NYY', teamFull: 'New York Yankees', position: 'RF', bats: 'R', throws: 'R', number: '99', type: 'batter' },
  { id: 'p-juan-soto', name: 'Juan Soto', team: 'NYY', teamFull: 'New York Yankees', position: 'LF', bats: 'L', throws: 'L', number: '22', type: 'batter' },
  { id: 'p-gerrit-cole', name: 'Gerrit Cole', team: 'NYY', teamFull: 'New York Yankees', position: 'SP', bats: 'R', throws: 'R', number: '45', type: 'pitcher' },
  { id: 'p-gleyber-torres', name: 'Gleyber Torres', team: 'NYY', teamFull: 'New York Yankees', position: '2B', bats: 'R', throws: 'R', number: '25', type: 'batter' },
  { id: 'p-anthony-volpe', name: 'Anthony Volpe', team: 'NYY', teamFull: 'New York Yankees', position: 'SS', bats: 'R', throws: 'R', number: '11', type: 'batter' },
  { id: 'p-giancarlo-stanton', name: 'Giancarlo Stanton', team: 'NYY', teamFull: 'New York Yankees', position: 'DH', bats: 'R', throws: 'R', number: '27', type: 'batter' },
  { id: 'p-jazz-chisholm', name: 'Jazz Chisholm Jr.', team: 'NYY', teamFull: 'New York Yankees', position: '3B', bats: 'L', throws: 'R', number: '13', type: 'batter' },
  { id: 'p-carlos-rodon', name: 'Carlos Rodón', team: 'NYY', teamFull: 'New York Yankees', position: 'SP', bats: 'L', throws: 'L', number: '55', type: 'pitcher' },
  // LAD
  { id: 'p-freddie-freeman', name: 'Freddie Freeman', team: 'LAD', teamFull: 'Los Angeles Dodgers', position: '1B', bats: 'L', throws: 'R', number: '5', type: 'batter' },
  { id: 'p-mookie-betts', name: 'Mookie Betts', team: 'LAD', teamFull: 'Los Angeles Dodgers', position: 'SS', bats: 'R', throws: 'R', number: '50', type: 'batter' },
  { id: 'p-shohei-ohtani', name: 'Shohei Ohtani', team: 'LAD', teamFull: 'Los Angeles Dodgers', position: 'DH', bats: 'L', throws: 'R', number: '17', type: 'two-way' },
  { id: 'p-tyler-glasnow', name: 'Tyler Glasnow', team: 'LAD', teamFull: 'Los Angeles Dodgers', position: 'SP', bats: 'L', throws: 'R', number: '31', type: 'pitcher' },
  { id: 'p-will-smith-lad', name: 'Will Smith', team: 'LAD', teamFull: 'Los Angeles Dodgers', position: 'C', bats: 'R', throws: 'R', number: '16', type: 'batter' },
  { id: 'p-teoscar-hernandez', name: 'Teoscar Hernández', team: 'LAD', teamFull: 'Los Angeles Dodgers', position: 'RF', bats: 'R', throws: 'R', number: '37', type: 'batter' },
  { id: 'p-gavin-lux', name: 'Gavin Lux', team: 'LAD', teamFull: 'Los Angeles Dodgers', position: '2B', bats: 'L', throws: 'R', number: '9', type: 'batter' },
  // ATL
  { id: 'p-ronald-acuna', name: 'Ronald Acuña Jr.', team: 'ATL', teamFull: 'Atlanta Braves', position: 'RF', bats: 'R', throws: 'R', number: '13', type: 'batter' },
  { id: 'p-spencer-strider', name: 'Spencer Strider', team: 'ATL', teamFull: 'Atlanta Braves', position: 'SP', bats: 'R', throws: 'R', number: '99', type: 'pitcher' },
  { id: 'p-matt-olson', name: 'Matt Olson', team: 'ATL', teamFull: 'Atlanta Braves', position: '1B', bats: 'L', throws: 'R', number: '28', type: 'batter' },
  { id: 'p-austin-riley', name: 'Austin Riley', team: 'ATL', teamFull: 'Atlanta Braves', position: '3B', bats: 'R', throws: 'R', number: '27', type: 'batter' },
  { id: 'p-ozzie-albies', name: 'Ozzie Albies', team: 'ATL', teamFull: 'Atlanta Braves', position: '2B', bats: 'S', throws: 'R', number: '1', type: 'batter' },
  { id: 'p-max-fried', name: 'Max Fried', team: 'NYY', teamFull: 'New York Yankees', position: 'SP', bats: 'L', throws: 'L', number: '54', type: 'pitcher' },
  { id: 'p-chris-sale', name: 'Chris Sale', team: 'ATL', teamFull: 'Atlanta Braves', position: 'SP', bats: 'L', throws: 'L', number: '51', type: 'pitcher' },
  // HOU
  { id: 'p-yordan-alvarez', name: 'Yordan Alvarez', team: 'HOU', teamFull: 'Houston Astros', position: 'DH', bats: 'L', throws: 'R', number: '44', type: 'batter' },
  { id: 'p-framber-valdez', name: 'Framber Valdez', team: 'HOU', teamFull: 'Houston Astros', position: 'SP', bats: 'L', throws: 'L', number: '59', type: 'pitcher' },
  { id: 'p-jose-altuve', name: 'José Altuve', team: 'HOU', teamFull: 'Houston Astros', position: '2B', bats: 'R', throws: 'R', number: '27', type: 'batter' },
  { id: 'p-alex-bregman', name: 'Alex Bregman', team: 'BOS', teamFull: 'Boston Red Sox', position: '3B', bats: 'R', throws: 'R', number: '2', type: 'batter' },
  { id: 'p-kyle-tucker', name: 'Kyle Tucker', team: 'CHC', teamFull: 'Chicago Cubs', position: 'RF', bats: 'L', throws: 'R', number: '30', type: 'batter' },
  { id: 'p-hunter-brown', name: 'Hunter Brown', team: 'HOU', teamFull: 'Houston Astros', position: 'SP', bats: 'R', throws: 'R', number: '58', type: 'pitcher' },
  // PHI
  { id: 'p-bryce-harper', name: 'Bryce Harper', team: 'PHI', teamFull: 'Philadelphia Phillies', position: '1B', bats: 'L', throws: 'R', number: '3', type: 'batter' },
  { id: 'p-zack-wheeler', name: 'Zack Wheeler', team: 'PHI', teamFull: 'Philadelphia Phillies', position: 'SP', bats: 'R', throws: 'R', number: '45', type: 'pitcher' },
  { id: 'p-trea-turner', name: 'Trea Turner', team: 'PHI', teamFull: 'Philadelphia Phillies', position: 'SS', bats: 'R', throws: 'R', number: '7', type: 'batter' },
  { id: 'p-kyle-schwarber', name: 'Kyle Schwarber', team: 'PHI', teamFull: 'Philadelphia Phillies', position: 'LF', bats: 'L', throws: 'R', number: '12', type: 'batter' },
  { id: 'p-ranger-suarez', name: 'Ranger Suárez', team: 'PHI', teamFull: 'Philadelphia Phillies', position: 'SP', bats: 'L', throws: 'L', number: '55', type: 'pitcher' },
  { id: 'p-nick-castellanos', name: 'Nick Castellanos', team: 'PHI', teamFull: 'Philadelphia Phillies', position: 'RF', bats: 'R', throws: 'R', number: '8', type: 'batter' },
  // BOS
  { id: 'p-rafael-devers', name: 'Rafael Devers', team: 'BOS', teamFull: 'Boston Red Sox', position: '3B', bats: 'L', throws: 'R', number: '11', type: 'batter' },
  { id: 'p-triston-casas', name: 'Triston Casas', team: 'BOS', teamFull: 'Boston Red Sox', position: '1B', bats: 'L', throws: 'R', number: '36', type: 'batter' },
  { id: 'p-jarren-duran', name: 'Jarren Duran', team: 'BOS', teamFull: 'Boston Red Sox', position: 'CF', bats: 'L', throws: 'R', number: '16', type: 'batter' },
  { id: 'p-brayan-bello', name: 'Brayan Bello', team: 'BOS', teamFull: 'Boston Red Sox', position: 'SP', bats: 'R', throws: 'R', number: '66', type: 'pitcher' },
  // BAL
  { id: 'p-gunnar-henderson', name: 'Gunnar Henderson', team: 'BAL', teamFull: 'Baltimore Orioles', position: 'SS', bats: 'L', throws: 'R', number: '2', type: 'batter' },
  { id: 'p-adley-rutschman', name: 'Adley Rutschman', team: 'BAL', teamFull: 'Baltimore Orioles', position: 'C', bats: 'S', throws: 'R', number: '35', type: 'batter' },
  { id: 'p-corbin-burnes', name: 'Corbin Burnes', team: 'ARI', teamFull: 'Arizona Diamondbacks', position: 'SP', bats: 'R', throws: 'R', number: '39', type: 'pitcher' },
  { id: 'p-cedric-mullins', name: 'Cedric Mullins', team: 'BAL', teamFull: 'Baltimore Orioles', position: 'CF', bats: 'S', throws: 'L', number: '31', type: 'batter' },
  { id: 'p-ryan-mountcastle', name: 'Ryan Mountcastle', team: 'BAL', teamFull: 'Baltimore Orioles', position: '1B', bats: 'R', throws: 'R', number: '6', type: 'batter' },
  // TEX
  { id: 'p-corey-seager', name: 'Corey Seager', team: 'TEX', teamFull: 'Texas Rangers', position: 'SS', bats: 'L', throws: 'R', number: '5', type: 'batter' },
  { id: 'p-marcus-semien', name: 'Marcus Semien', team: 'TEX', teamFull: 'Texas Rangers', position: '2B', bats: 'R', throws: 'R', number: '2', type: 'batter' },
  { id: 'p-nathan-eovaldi', name: 'Nathan Eovaldi', team: 'TEX', teamFull: 'Texas Rangers', position: 'SP', bats: 'R', throws: 'R', number: '17', type: 'pitcher' },
  { id: 'p-adolis-garcia', name: 'Adolis García', team: 'TEX', teamFull: 'Texas Rangers', position: 'RF', bats: 'R', throws: 'R', number: '53', type: 'batter' },
  // SD
  { id: 'p-fernando-tatis', name: 'Fernando Tatis Jr.', team: 'SD', teamFull: 'San Diego Padres', position: 'RF', bats: 'R', throws: 'R', number: '23', type: 'batter' },
  { id: 'p-dylan-cease', name: 'Dylan Cease', team: 'SD', teamFull: 'San Diego Padres', position: 'SP', bats: 'R', throws: 'R', number: '84', type: 'pitcher' },
  { id: 'p-xander-bogaerts', name: 'Xander Bogaerts', team: 'SD', teamFull: 'San Diego Padres', position: 'SS', bats: 'R', throws: 'R', number: '2', type: 'batter' },
  { id: 'p-manny-machado', name: 'Manny Machado', team: 'SD', teamFull: 'San Diego Padres', position: '3B', bats: 'R', throws: 'R', number: '13', type: 'batter' },
  { id: 'p-jake-cronenworth', name: 'Jake Cronenworth', team: 'SD', teamFull: 'San Diego Padres', position: '2B', bats: 'L', throws: 'R', number: '9', type: 'batter' },
  // SF
  { id: 'p-logan-webb', name: 'Logan Webb', team: 'SF', teamFull: 'San Francisco Giants', position: 'SP', bats: 'R', throws: 'R', number: '62', type: 'pitcher' },
  { id: 'p-matt-chapman', name: 'Matt Chapman', team: 'SF', teamFull: 'San Francisco Giants', position: '3B', bats: 'R', throws: 'R', number: '26', type: 'batter' },
  { id: 'p-jung-hoo-lee', name: 'Jung Hoo Lee', team: 'SF', teamFull: 'San Francisco Giants', position: 'CF', bats: 'L', throws: 'R', number: '51', type: 'batter' },
  { id: 'p-patrick-bailey', name: 'Patrick Bailey', team: 'SF', teamFull: 'San Francisco Giants', position: 'C', bats: 'S', throws: 'R', number: '14', type: 'batter' },
  // SEA
  { id: 'p-julio-rodriguez', name: 'Julio Rodríguez', team: 'SEA', teamFull: 'Seattle Mariners', position: 'CF', bats: 'R', throws: 'R', number: '44', type: 'batter' },
  { id: 'p-logan-gilbert', name: 'Logan Gilbert', team: 'SEA', teamFull: 'Seattle Mariners', position: 'SP', bats: 'R', throws: 'R', number: '36', type: 'pitcher' },
  { id: 'p-cal-raleigh', name: 'Cal Raleigh', team: 'SEA', teamFull: 'Seattle Mariners', position: 'C', bats: 'S', throws: 'R', number: '29', type: 'batter' },
  { id: 'p-george-kirby', name: 'George Kirby', team: 'SEA', teamFull: 'Seattle Mariners', position: 'SP', bats: 'R', throws: 'R', number: '68', type: 'pitcher' },
  // MIN
  { id: 'p-byron-buxton', name: 'Byron Buxton', team: 'MIN', teamFull: 'Minnesota Twins', position: 'CF', bats: 'R', throws: 'R', number: '25', type: 'batter' },
  { id: 'p-pablo-lopez', name: 'Pablo López', team: 'MIN', teamFull: 'Minnesota Twins', position: 'SP', bats: 'R', throws: 'R', number: '49', type: 'pitcher' },
  { id: 'p-carlos-correa', name: 'Carlos Correa', team: 'MIN', teamFull: 'Minnesota Twins', position: 'SS', bats: 'R', throws: 'R', number: '4', type: 'batter' },
  { id: 'p-royce-lewis', name: 'Royce Lewis', team: 'MIN', teamFull: 'Minnesota Twins', position: '3B', bats: 'R', throws: 'R', number: '23', type: 'batter' },
  // TOR
  { id: 'p-vladimir-guerrero', name: 'Vladimir Guerrero Jr.', team: 'TOR', teamFull: 'Toronto Blue Jays', position: '1B', bats: 'R', throws: 'R', number: '27', type: 'batter' },
  { id: 'p-bo-bichette', name: 'Bo Bichette', team: 'TOR', teamFull: 'Toronto Blue Jays', position: 'SS', bats: 'R', throws: 'R', number: '11', type: 'batter' },
  { id: 'p-kevin-gausman', name: 'Kevin Gausman', team: 'TOR', teamFull: 'Toronto Blue Jays', position: 'SP', bats: 'R', throws: 'R', number: '34', type: 'pitcher' },
  { id: 'p-george-springer', name: 'George Springer', team: 'TOR', teamFull: 'Toronto Blue Jays', position: 'CF', bats: 'R', throws: 'R', number: '4', type: 'batter' },
  // NYM
  { id: 'p-pete-alonso', name: 'Pete Alonso', team: 'NYM', teamFull: 'New York Mets', position: '1B', bats: 'R', throws: 'R', number: '20', type: 'batter' },
  { id: 'p-francisco-lindor', name: 'Francisco Lindor', team: 'NYM', teamFull: 'New York Mets', position: 'SS', bats: 'S', throws: 'R', number: '12', type: 'batter' },
  { id: 'p-kodai-senga', name: 'Kodai Senga', team: 'NYM', teamFull: 'New York Mets', position: 'SP', bats: 'R', throws: 'R', number: '34', type: 'pitcher' },
  { id: 'p-brandon-nimmo', name: 'Brandon Nimmo', team: 'NYM', teamFull: 'New York Mets', position: 'CF', bats: 'L', throws: 'R', number: '9', type: 'batter' },
  { id: 'p-sean-manaea', name: 'Sean Manaea', team: 'NYM', teamFull: 'New York Mets', position: 'SP', bats: 'R', throws: 'L', number: '59', type: 'pitcher' },
  // MIL
  { id: 'p-willy-adames', name: 'Willy Adames', team: 'SF', teamFull: 'San Francisco Giants', position: 'SS', bats: 'R', throws: 'R', number: '2', type: 'batter' },
  { id: 'p-freddy-peralta', name: 'Freddy Peralta', team: 'MIL', teamFull: 'Milwaukee Brewers', position: 'SP', bats: 'R', throws: 'R', number: '51', type: 'pitcher' },
  { id: 'p-christian-yelich', name: 'Christian Yelich', team: 'MIL', teamFull: 'Milwaukee Brewers', position: 'LF', bats: 'L', throws: 'R', number: '22', type: 'batter' },
  { id: 'p-jackson-chourio', name: 'Jackson Chourio', team: 'MIL', teamFull: 'Milwaukee Brewers', position: 'LF', bats: 'R', throws: 'R', number: '11', type: 'batter' },
  // CHC
  { id: 'p-cody-bellinger', name: 'Cody Bellinger', team: 'CHC', teamFull: 'Chicago Cubs', position: 'CF', bats: 'L', throws: 'L', number: '24', type: 'batter' },
  { id: 'p-justin-steele', name: 'Justin Steele', team: 'CHC', teamFull: 'Chicago Cubs', position: 'SP', bats: 'L', throws: 'L', number: '35', type: 'pitcher' },
  { id: 'p-ian-happ', name: 'Ian Happ', team: 'CHC', teamFull: 'Chicago Cubs', position: 'LF', bats: 'S', throws: 'R', number: '8', type: 'batter' },
  { id: 'p-dansby-swanson', name: 'Dansby Swanson', team: 'CHC', teamFull: 'Chicago Cubs', position: 'SS', bats: 'R', throws: 'R', number: '7', type: 'batter' },
  // STL
  { id: 'p-nolan-arenado', name: 'Nolan Arenado', team: 'STL', teamFull: 'St. Louis Cardinals', position: '3B', bats: 'R', throws: 'R', number: '28', type: 'batter' },
  { id: 'p-paul-goldschmidt', name: 'Paul Goldschmidt', team: 'STL', teamFull: 'St. Louis Cardinals', position: '1B', bats: 'R', throws: 'R', number: '46', type: 'batter' },
  { id: 'p-miles-mikolas', name: 'Miles Mikolas', team: 'STL', teamFull: 'St. Louis Cardinals', position: 'SP', bats: 'R', throws: 'R', number: '39', type: 'pitcher' },
  { id: 'p-lars-nootbaar', name: 'Lars Nootbaar', team: 'STL', teamFull: 'St. Louis Cardinals', position: 'RF', bats: 'L', throws: 'R', number: '21', type: 'batter' },
  // CIN
  { id: 'p-elly-de-la-cruz', name: 'Elly De La Cruz', team: 'CIN', teamFull: 'Cincinnati Reds', position: 'SS', bats: 'S', throws: 'R', number: '44', type: 'batter' },
  { id: 'p-hunter-greene', name: 'Hunter Greene', team: 'CIN', teamFull: 'Cincinnati Reds', position: 'SP', bats: 'R', throws: 'R', number: '21', type: 'pitcher' },
  { id: 'p-tyler-stephenson', name: 'Tyler Stephenson', team: 'CIN', teamFull: 'Cincinnati Reds', position: 'C', bats: 'R', throws: 'R', number: '37', type: 'batter' },
  { id: 'p-jonathan-india', name: 'Jonathan India', team: 'CIN', teamFull: 'Cincinnati Reds', position: '2B', bats: 'R', throws: 'R', number: '6', type: 'batter' },
  // CLE
  { id: 'p-jose-ramirez', name: 'José Ramírez', team: 'CLE', teamFull: 'Cleveland Guardians', position: '3B', bats: 'S', throws: 'R', number: '11', type: 'batter' },
  { id: 'p-shane-bieber', name: 'Shane Bieber', team: 'CLE', teamFull: 'Cleveland Guardians', position: 'SP', bats: 'R', throws: 'R', number: '57', type: 'pitcher' },
  { id: 'p-steven-kwan', name: 'Steven Kwan', team: 'CLE', teamFull: 'Cleveland Guardians', position: 'LF', bats: 'L', throws: 'L', number: '38', type: 'batter' },
  { id: 'p-josh-naylor', name: 'Josh Naylor', team: 'CLE', teamFull: 'Cleveland Guardians', position: '1B', bats: 'L', throws: 'L', number: '22', type: 'batter' },
  // DET
  { id: 'p-tarik-skubal', name: 'Tarik Skubal', team: 'DET', teamFull: 'Detroit Tigers', position: 'SP', bats: 'L', throws: 'L', number: '29', type: 'pitcher' },
  { id: 'p-riley-greene', name: 'Riley Greene', team: 'DET', teamFull: 'Detroit Tigers', position: 'CF', bats: 'L', throws: 'L', number: '31', type: 'batter' },
  { id: 'p-kerry-carpenter', name: 'Kerry Carpenter', team: 'DET', teamFull: 'Detroit Tigers', position: 'LF', bats: 'L', throws: 'R', number: '30', type: 'batter' },
  { id: 'p-javier-baez', name: 'Javier Báez', team: 'DET', teamFull: 'Detroit Tigers', position: 'SS', bats: 'R', throws: 'R', number: '28', type: 'batter' },
  // KC
  { id: 'p-bobby-witt', name: 'Bobby Witt Jr.', team: 'KC', teamFull: 'Kansas City Royals', position: 'SS', bats: 'R', throws: 'R', number: '7', type: 'batter' },
  { id: 'p-cole-ragans', name: 'Cole Ragans', team: 'KC', teamFull: 'Kansas City Royals', position: 'SP', bats: 'L', throws: 'L', number: '55', type: 'pitcher' },
  { id: 'p-vinnie-pasquantino', name: 'Vinnie Pasquantino', team: 'KC', teamFull: 'Kansas City Royals', position: '1B', bats: 'L', throws: 'R', number: '9', type: 'batter' },
  { id: 'p-salvador-perez', name: 'Salvador Pérez', team: 'KC', teamFull: 'Kansas City Royals', position: 'C', bats: 'R', throws: 'R', number: '13', type: 'batter' },
  // ARI
  { id: 'p-ketel-marte', name: 'Ketel Marte', team: 'ARI', teamFull: 'Arizona Diamondbacks', position: '2B', bats: 'S', throws: 'R', number: '4', type: 'batter' },
  { id: 'p-zac-gallen', name: 'Zac Gallen', team: 'ARI', teamFull: 'Arizona Diamondbacks', position: 'SP', bats: 'R', throws: 'R', number: '23', type: 'pitcher' },
  { id: 'p-christian-walker', name: 'Christian Walker', team: 'ARI', teamFull: 'Arizona Diamondbacks', position: '1B', bats: 'R', throws: 'R', number: '53', type: 'batter' },
  { id: 'p-lourdes-gurriel', name: 'Lourdes Gurriel Jr.', team: 'ARI', teamFull: 'Arizona Diamondbacks', position: 'LF', bats: 'R', throws: 'R', number: '12', type: 'batter' },
  { id: 'p-gabriel-moreno', name: 'Gabriel Moreno', team: 'ARI', teamFull: 'Arizona Diamondbacks', position: 'C', bats: 'R', throws: 'R', number: '14', type: 'batter' },
  // COL
  { id: 'p-ryan-mcmahon', name: 'Ryan McMahon', team: 'COL', teamFull: 'Colorado Rockies', position: '3B', bats: 'L', throws: 'R', number: '24', type: 'batter' },
  { id: 'p-charlie-blackmon', name: 'Charlie Blackmon', team: 'COL', teamFull: 'Colorado Rockies', position: 'RF', bats: 'L', throws: 'R', number: '19', type: 'batter' },
  { id: 'p-kyle-freeland', name: 'Kyle Freeland', team: 'COL', teamFull: 'Colorado Rockies', position: 'SP', bats: 'L', throws: 'L', number: '21', type: 'pitcher' },
  // MIA
  { id: 'p-sandy-alcantara', name: 'Sandy Alcántara', team: 'MIA', teamFull: 'Miami Marlins', position: 'SP', bats: 'R', throws: 'R', number: '22', type: 'pitcher' },
  { id: 'p-jazz-chisholm-mia', name: 'Jazz Chisholm Jr.', team: 'MIA', teamFull: 'Miami Marlins', position: '2B', bats: 'L', throws: 'R', number: '2', type: 'batter' },
  { id: 'p-luis-arraez', name: 'Luis Arráez', team: 'SD', teamFull: 'San Diego Padres', position: '2B', bats: 'L', throws: 'R', number: '4', type: 'batter' },
  // PIT
  { id: 'p-paul-skenes', name: 'Paul Skenes', team: 'PIT', teamFull: 'Pittsburgh Pirates', position: 'SP', bats: 'R', throws: 'R', number: '30', type: 'pitcher' },
  { id: 'p-oneil-cruz', name: "Oneil Cruz", team: 'PIT', teamFull: 'Pittsburgh Pirates', position: 'SS', bats: 'L', throws: 'R', number: '15', type: 'batter' },
  { id: 'p-andrew-mccutchen', name: 'Andrew McCutchen', team: 'PIT', teamFull: 'Pittsburgh Pirates', position: 'LF', bats: 'R', throws: 'R', number: '22', type: 'batter' },
  // TB
  { id: 'p-yandy-diaz', name: 'Yandy Díaz', team: 'TB', teamFull: 'Tampa Bay Rays', position: '1B', bats: 'R', throws: 'R', number: '2', type: 'batter' },
  { id: 'p-zach-eflin', name: 'Zach Eflin', team: 'TB', teamFull: 'Tampa Bay Rays', position: 'SP', bats: 'R', throws: 'R', number: '24', type: 'pitcher' },
  { id: 'p-randy-arozarena', name: 'Randy Arozarena', team: 'SEA', teamFull: 'Seattle Mariners', position: 'LF', bats: 'R', throws: 'R', number: '56', type: 'batter' },
  // WSH
  { id: 'p-cj-abrams', name: 'CJ Abrams', team: 'WSH', teamFull: 'Washington Nationals', position: 'SS', bats: 'L', throws: 'R', number: '5', type: 'batter' },
  { id: 'p-mackenzie-gore', name: 'MacKenzie Gore', team: 'WSH', teamFull: 'Washington Nationals', position: 'SP', bats: 'L', throws: 'L', number: '1', type: 'pitcher' },
  { id: 'p-lane-thomas', name: 'Lane Thomas', team: 'WSH', teamFull: 'Washington Nationals', position: 'RF', bats: 'R', throws: 'R', number: '28', type: 'batter' },
  // OAK
  { id: 'p-mason-miller', name: 'Mason Miller', team: 'OAK', teamFull: 'Oakland Athletics', position: 'RP', bats: 'R', throws: 'R', number: '19', type: 'pitcher' },
  { id: 'p-brent-rooker', name: 'Brent Rooker', team: 'OAK', teamFull: 'Oakland Athletics', position: 'DH', bats: 'R', throws: 'R', number: '25', type: 'batter' },
  { id: 'p-jp-sears', name: 'JP Sears', team: 'OAK', teamFull: 'Oakland Athletics', position: 'SP', bats: 'L', throws: 'L', number: '38', type: 'pitcher' },
  // LAA
  { id: 'p-mike-trout', name: 'Mike Trout', team: 'LAA', teamFull: 'Los Angeles Angels', position: 'CF', bats: 'R', throws: 'R', number: '27', type: 'batter' },
  { id: 'p-anthony-rendon', name: 'Anthony Rendon', team: 'LAA', teamFull: 'Los Angeles Angels', position: '3B', bats: 'R', throws: 'R', number: '6', type: 'batter' },
  { id: 'p-reid-detmers', name: 'Reid Detmers', team: 'LAA', teamFull: 'Los Angeles Angels', position: 'SP', bats: 'L', throws: 'L', number: '48', type: 'pitcher' },
  // CWS
  { id: 'p-andrew-vaughn', name: 'Andrew Vaughn', team: 'CWS', teamFull: 'Chicago White Sox', position: '1B', bats: 'R', throws: 'R', number: '25', type: 'batter' },
  { id: 'p-garrett-crochet', name: 'Garrett Crochet', team: 'BOS', teamFull: 'Boston Red Sox', position: 'SP', bats: 'L', throws: 'L', number: '45', type: 'pitcher' },
];

/**
 * Get all unique teams from the players list
 */
export function getAllTeams(): string[] {
  return Object.keys(MLB_TEAM_FULL_NAMES).sort();
}

/**
 * Search players by name or team
 */
export function searchPlayers(query: string, limit = 20): MLBPlayer[] {
  if (!query.trim()) return ALL_MLB_PLAYERS.slice(0, limit);
  const q = query.toLowerCase();
  return ALL_MLB_PLAYERS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.team.toLowerCase().includes(q) ||
      p.teamFull.toLowerCase().includes(q) ||
      p.position.toLowerCase().includes(q)
  ).slice(0, limit);
}

/**
 * Get players by team
 */
export function getPlayersByTeam(team: string): MLBPlayer[] {
  return ALL_MLB_PLAYERS.filter((p) => p.team === team);
}

/**
 * Get player by id
 */
export function getPlayerById(id: string): MLBPlayer | undefined {
  return ALL_MLB_PLAYERS.find((p) => p.id === id);
}

/**
 * Get all batters
 */
export function getAllBatters(): MLBPlayer[] {
  return ALL_MLB_PLAYERS.filter((p) => p.type === 'batter' || p.type === 'two-way');
}

/**
 * Get all pitchers
 */
export function getAllPitchers(): MLBPlayer[] {
  return ALL_MLB_PLAYERS.filter((p) => p.type === 'pitcher' || p.type === 'two-way');
}
