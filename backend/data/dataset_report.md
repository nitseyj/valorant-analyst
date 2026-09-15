# Dataset Inspection Report

Root: `D:\valorant-analyst\backend\data\raw`

Tables found: 131


## all_ids


### `all_ids\all_matches_games_ids.csv`

- Rows: 27,450 | Columns: 11


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2021, Champions Tour North America: Last Ch..., Champions Tour South America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour Asia-Pacific: Last Cha... |
| Tournament ID | int64 | 0.0% | 449, 558, 561, 559, 560 |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, GCC and Iraq, Levant and North Africa |
| Stage ID | int64 | 0.0% | 945, 1486, 1094, 1097, 1376 |
| Match Type | object | 0.0% | Opening (D), Opening (C), Opening (B), Winner's (D), Opening (A) |
| Match Type ID | float64 | 0.3% | 8272.0, 8268.0, 8264.0, 8273.0, 8260.0 |
| Match Name | object | 0.0% | Vision Strikers vs FULL SENSE, Team Vikings vs Crazy Raccoon, FNATIC vs Cloud9, Gambit Esports vs Team Secret, Sentinels vs FURIA |
| Match ID | int64 | 0.0% | 51282, 51278, 51283, 51277, 51273 |
| Map | object | 0.0% | Haven, Breeze, Icebox, Split, Fracture |
| Game ID | float64 | 0.0% | 57948.0, 57949.0, 57936.0, 57937.0, 57951.0 |
| Year | int64 | 0.0% | 2021, 2022, 2023, 2024, 2025 |

### `all_ids\all_players_ids.csv`

- Rows: 15,654 | Columns: 2


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Player | object | 0.0% | MaKo, stax, Rb, k1Ng, BuZz |
| Player ID | float64 | 2.6% | 4462.0, 485.0, 488.0, 771.0, 804.0 |

### `all_ids\all_teams_ids.csv`

- Rows: 4,025 | Columns: 2


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Team | object | 0.0% | Vision Strikers, FULL SENSE, Team Vikings, Crazy Raccoon, FNATIC |
| Team ID | float64 | 0.0% | 198.0, 4050.0, 420.0, 277.0, 2593.0 |

### `all_ids\all_teams_mapping.csv`

- Rows: 3,524 | Columns: 2


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Abbreviated | object | 0.1% | VS, FS, VKS, CR, FNC |
| Full Name | object | 0.0% | Vision Strikers, FULL SENSE, Team Vikings, Carleton Ravens, FNATIC |

### `all_ids\all_tournaments_stages_match_types_ids.csv`

- Rows: 3,539 | Columns: 7


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Champions Tour Asia-Pacific: Last Cha..., Champions Tour Brazil Stage 1: Challe..., Champions Tour Brazil Stage 1: Challe..., Champions Tour Brazil Stage 1: Challe..., Champions Tour Brazil Stage 1: Masters |
| Tournament ID | int64 | 0.0% | 560, 292, 301, 326, 338 |
| Stage | object | 0.0% | All Stages, Main Event, Open Qualifier, Tournament, Open Qualifier #3 |
| Stage ID | float64 | 7.0% | 1096.0, 596.0, 594.0, 624.0, 623.0 |
| Match Type | object | 0.0% | All Match Types, Upper Round 1, Grand Final, Lower Bracket Final, Lower Bracket Round 1 |
| Match Type ID | float64 | 7.5% | 7577.0, 7576.0, 7572.0, 7573.0, 7574.0 |
| Year | int64 | 0.0% | 2021, 2022, 2023, 2024, 2025 |

## vct_2021


### `vct_2021\agents\agents_pick_rates.csv`

- Rows: 192,120 | Columns: 6


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Champions Tour North America: Last Ch..., Champions Tour South America: Last Ch..., Champions Tour Asia-Pacific: Last Cha..., Valorant Champions 2021, Champions Tour EMEA: Last Chance Qual... |
| Stage | object | 0.0% | Main Event, All Stages, Playoffs, Group Stage, Wildcard Qualifier |
| Match Type | object | 0.0% | Upper Quarterfinals, Upper Semifinals, Upper Final, Grand Final, Lower Round 1 |
| Map | object | 0.0% | All Maps, Breeze, Ascent, Icebox, Split |
| Agent | object | 0.0% | jett, sova, viper, skye, astra |
| Pick Rate | object | 0.0% | 91%, 77%, 68%, 64%, 55% |

### `vct_2021\agents\maps_stats.csv`

- Rows: 8,005 | Columns: 7


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Champions Tour North America: Last Ch..., Champions Tour South America: Last Ch..., Champions Tour Asia-Pacific: Last Cha..., Valorant Champions 2021, Champions Tour EMEA: Last Chance Qual... |
| Stage | object | 0.0% | Main Event, All Stages, Playoffs, Group Stage, Wildcard Qualifier |
| Match Type | object | 0.0% | Upper Quarterfinals, Upper Semifinals, Upper Final, Grand Final, Lower Round 1 |
| Map | object | 0.0% | All Maps, Breeze, Ascent, Icebox, Split |
| Total Maps Played | int64 | 0.0% | 11, 3, 2, 1, 6 |
| Attacker Side Win Percentage | object | 0.0% | 46%, 61%, 36%, 54%, 30% |
| Defender Side Win Percentage | object | 0.0% | 54%, 39%, 64%, 46%, 70% |

### `vct_2021\agents\teams_picked_agents.csv`

- Rows: 224,050 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Champions Tour North America: Last Ch..., Champions Tour South America: Last Ch..., Champions Tour Asia-Pacific: Last Cha..., Valorant Champions 2021, Champions Tour EMEA: Last Chance Qual... |
| Stage | object | 0.0% | Main Event, All Stages, Playoffs, Group Stage, Wildcard Qualifier |
| Match Type | object | 0.0% | Upper Quarterfinals, Upper Semifinals, Upper Final, Grand Final, Lower Round 1 |
| Map | object | 0.0% | Breeze, Split, Icebox, Haven, Ascent |
| Team | object | 0.0% | 100 Thieves, Gen.G, FaZe Clan, Rise, Version1 |
| Agent | object | 0.0% | jett, sova, viper, skye, reyna |
| Total Wins By Map | int64 | 0.0% | 0, 1, 4, 2, 3 |
| Total Loss By Map | int64 | 0.0% | 1, 0, 3, 2, 4 |
| Total Maps Played | int64 | 0.0% | 1, 5, 4, 2, 3 |

### `vct_2021\ids\players_ids.csv`

- Rows: 11,190 | Columns: 2


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Player | object | 0.0% | MaKo, stax, Rb, k1Ng, BuZz |
| Player ID | float64 | 3.7% | 4462.0, 485.0, 488.0, 771.0, 804.0 |

### `vct_2021\ids\teams_ids.csv`

- Rows: 2,741 | Columns: 2


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Team | object | 0.0% | Vision Strikers, FULL SENSE, Team Vikings, Crazy Raccoon, FNATIC |
| Team ID | float64 | 0.0% | 198.0, 4050.0, 420.0, 277.0, 2593.0 |

### `vct_2021\ids\tournaments_stages_match_types_ids.csv`

- Rows: 1,777 | Columns: 6


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Champions Tour North America: Last Ch..., Champions Tour South America: Last Ch..., Champions Tour Asia-Pacific: Last Cha..., Valorant Champions 2021, Champions Tour EMEA: Last Chance Qual... |
| Tournament ID | int64 | 0.0% | 558, 561, 560, 449, 559 |
| Stage | object | 0.0% | Main Event, All Stages, Playoffs, Group Stage, Wildcard Qualifier |
| Stage ID | float64 | 8.0% | 1094.0, 1376.0, 1097.0, 1096.0, 1486.0 |
| Match Type | object | 0.0% | Upper Quarterfinals, Upper Semifinals, Upper Final, Grand Final, Lower Round 1 |
| Match Type ID | float64 | 8.0% | 7644.0, 7645.0, 7646.0, 7647.0, 7648.0 |

### `vct_2021\ids\tournaments_stages_matches_games_ids.csv`

- Rows: 14,489 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2021, Champions Tour North America: Last Ch..., Champions Tour South America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour Asia-Pacific: Last Cha... |
| Tournament ID | int64 | 0.0% | 449, 558, 561, 559, 560 |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, GCC and Iraq, Levant and North Africa |
| Stage ID | int64 | 0.0% | 945, 1486, 1094, 1097, 1376 |
| Match Type | object | 0.0% | Opening (D), Opening (C), Opening (B), Winner's (D), Opening (A) |
| Match Name | object | 0.0% | Vision Strikers vs FULL SENSE, Team Vikings vs Crazy Raccoon, FNATIC vs Cloud9, Gambit Esports vs Team Secret, Sentinels vs FURIA |
| Match ID | int64 | 0.0% | 51282, 51278, 51283, 51277, 51273 |
| Map | object | 0.0% | Haven, Breeze, Icebox, Split, Fracture |
| Game ID | float64 | 0.0% | 57948.0, 57949.0, 57936.0, 57937.0, 57951.0 |

### `vct_2021\matches\draft_phase.csv`

- Rows: 3,378 | Columns: 7


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2021, Champions Tour North America: Last Ch..., Champions Tour South America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour Asia-Pacific: Last Cha... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, India Qualifier #1, Sri Lanka and Maldives Qualifier |
| Match Type | object | 0.0% | Opening (D), Opening (C), Opening (B), Winner's (D), Opening (A) |
| Match Name | object | 0.0% | Vision Strikers vs FULL SENSE, Team Vikings vs Crazy Raccoon, FNATIC vs Cloud9, Gambit Esports vs Team Secret, Sentinels vs FURIA |
| Team | object | 0.0% | FULL SENSE, Vision Strikers, Crazy Raccoon, Team Vikings, FNATIC |
| Action | object | 0.0% | ban, pick |
| Map | object | 0.0% | Fracture, Ascent, Haven, Breeze, Bind |

### `vct_2021\matches\eco_rounds.csv`

- Rows: 363,518 | Columns: 11


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2021, Champions Tour North America: Last Ch..., Champions Tour South America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour Asia-Pacific: Last Cha... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, GCC and Iraq, Levant and North Africa |
| Match Type | object | 0.0% | Opening (D), Opening (C), Opening (B), Winner's (D), Opening (A) |
| Match Name | object | 0.0% | Vision Strikers vs FULL SENSE, Team Vikings vs Crazy Raccoon, FNATIC vs Cloud9, Gambit Esports vs Team Secret, Sentinels vs FURIA |
| Map | object | 0.0% | Haven, Breeze, Icebox, Split, Fracture |
| Round Number | int64 | 0.0% | 1, 2, 3, 4, 5 |
| Team | object | 0.0% | Vision Strikers, FULL SENSE, Team Vikings, Crazy Raccoon, FNATIC |
| Loadout Value | object | 0.0% | 3.9k, 3.4k, 14.4k, 2.4k, 17.6k |
| Remaining Credits | object | 0.0% | 0.4k, 0.2k, 5.2k, 8.4k, 15.2k |
| Type | object | 0.0% | Eco: 0-5k, Semi-buy: 10-20k, Full buy: 20k+, Semi-eco: 5-10k |
| Outcome | object | 0.0% | Win, Loss |

### `vct_2021\matches\eco_stats.csv`

- Rows: 126,250 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2021, Champions Tour North America: Last Ch..., Champions Tour South America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour Asia-Pacific: Last Cha... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, GCC and Iraq, Levant and North Africa |
| Match Type | object | 0.0% | Opening (D), Opening (C), Opening (B), Winner's (D), Opening (A) |
| Match Name | object | 0.0% | Vision Strikers vs FULL SENSE, Team Vikings vs Crazy Raccoon, FNATIC vs Cloud9, Gambit Esports vs Team Secret, Sentinels vs FURIA |
| Map | object | 0.0% | Haven, Breeze, All Maps, Icebox, Split |
| Team | object | 0.0% | Vision Strikers, FULL SENSE, Team Vikings, Crazy Raccoon, FNATIC |
| Type | object | 0.0% | Pistol Won, Eco (won), $ (won), $$ (won), $$$ (won) |
| Initiated | float64 | 20.0% | 3.0, 0.0, 12.0, 4.0, 1.0 |
| Won | int64 | 0.0% | 2, 0, 1, 10, 3 |

### `vct_2021\matches\kills.csv`

- Rows: 946,875 | Columns: 13


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2021, Champions Tour North America: Last Ch..., Champions Tour South America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour Asia-Pacific: Last Cha... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, GCC and Iraq, Levant and North Africa |
| Match Type | object | 0.0% | Opening (D), Opening (C), Opening (B), Winner's (D), Opening (A) |
| Match Name | object | 0.0% | Vision Strikers vs FULL SENSE, Team Vikings vs Crazy Raccoon, FNATIC vs Cloud9, Gambit Esports vs Team Secret, Sentinels vs FURIA |
| Map | object | 0.0% | All Maps, Haven, Breeze, Icebox, Split |
| Player Team | object | 0.0% | Vision Strikers, Team Vikings, FNATIC, Gambit Esports, Sentinels |
| Player | object | 0.4% | MaKo, BuZz, Rb, stax, k1Ng |
| Enemy Team | object | 0.0% | FULL SENSE, Crazy Raccoon, Cloud9, Team Secret, FURIA |
| Enemy | object | 1.0% | PTC, LAMMYSNAX, ChAlalala, JohnOlsen, SuperBusS |
| Player Kills | float64 | 41.5% | 3.0, 5.0, 0.0, 9.0, 8.0 |
| Enemy Kills | float64 | 41.5% | 7.0, 1.0, 3.0, 6.0, 2.0 |
| Difference | float64 | 42.0% | -4.0, 4.0, -3.0, 3.0, 6.0 |
| Kill Type | object | 0.0% | All Kills, First Kills, Op Kills |

### `vct_2021\matches\kills_stats.csv`

- Rows: 125,783 | Columns: 20


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2021, Champions Tour North America: Last Ch..., Champions Tour South America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour Asia-Pacific: Last Cha... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, GCC and Iraq, Levant and North Africa |
| Match Type | object | 0.0% | Opening (D), Opening (C), Opening (B), Winner's (D), Opening (A) |
| Match Name | object | 0.0% | Vision Strikers vs FULL SENSE, Team Vikings vs Crazy Raccoon, FNATIC vs Cloud9, Gambit Esports vs Team Secret, Sentinels vs FURIA |
| Map | object | 0.0% | All Maps, Haven, Breeze, Icebox, Split |
| Team | object | 0.0% | Vision Strikers, FULL SENSE, Team Vikings, Crazy Raccoon, FNATIC |
| Player | object | 0.2% | stax, Rb, k1Ng, BuZz, MaKo |
| Agents | object | 0.0% | breach, skye, skye, sova, cypher, killjoy, jett, astra, viper |
| 2k | float64 | 7.1% | 3.0, 6.0, 10.0, 2.0, 4.0 |
| 3k | float64 | 39.8% | 3.0, 1.0, 2.0, 4.0, 5.0 |
| 4k | float64 | 81.0% | 1.0, 2.0, 3.0, 4.0, 5.0 |
| 5k | float64 | 97.4% | 1.0, 2.0, 3.0 |
| 1v1 | float64 | 77.4% | 1.0, 2.0, 3.0, 4.0, 5.0 |
| 1v2 | float64 | 87.6% | 1.0, 2.0, 3.0, 4.0 |
| 1v3 | float64 | 96.5% | 1.0, 2.0, 3.0 |
| 1v4 | float64 | 99.3% | 1.0, 2.0 |
| 1v5 | float64 | 99.9% | 1.0 |
| Econ | float64 | 0.0% | 38.0, 64.0, 63.0, 88.0, 55.0 |
| Spike Plants | float64 | 0.0% | 19.0, 1.0, 0.0, 3.0, 2.0 |
| Spike Defuses | float64 | 0.0% | 0.0, 1.0, 2.0, 3.0, 7.0 |

### `vct_2021\matches\maps_played.csv`

- Rows: 14,486 | Columns: 5


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2021, Champions Tour North America: Last Ch..., Champions Tour South America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour Asia-Pacific: Last Cha... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, GCC and Iraq, Levant and North Africa |
| Match Type | object | 0.0% | Opening (D), Opening (C), Opening (B), Winner's (D), Opening (A) |
| Match Name | object | 0.0% | Vision Strikers vs FULL SENSE, Team Vikings vs Crazy Raccoon, FNATIC vs Cloud9, Gambit Esports vs Team Secret, Sentinels vs FURIA |
| Map | object | 0.0% | Haven, Breeze, Icebox, Split, Fracture |

### `vct_2021\matches\maps_scores.csv`

- Rows: 14,503 | Columns: 16


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2021, Champions Tour North America: Last Ch..., Champions Tour South America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour Asia-Pacific: Last Cha... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, GCC and Iraq, Levant and North Africa |
| Match Type | object | 0.0% | Opening (D), Opening (C), Opening (B), Winner's (D), Opening (A) |
| Match Name | object | 0.0% | Vision Strikers vs FULL SENSE, Team Vikings vs Crazy Raccoon, FNATIC vs Cloud9, Gambit Esports vs Team Secret, Sentinels vs FURIA |
| Map | object | 0.1% | Haven, Breeze, Icebox, Split, Fracture |
| Team A | object | 0.0% | Vision Strikers, Team Vikings, FNATIC, Gambit Esports, Sentinels |
| Team A Score | int64 | 0.0% | 13, 11, 14, 6, 10 |
| Team A Attacker Score | int64 | 0.0% | 9, 6, 7, 8, 4 |
| Team A Defender Score | int64 | 0.0% | 4, 7, 6, 2, 1 |
| Team A Overtime Score | float64 | 91.4% | 2.0, 0.0, 1.0, 6.0, 5.0 |
| Team B | object | 0.0% | FULL SENSE, Crazy Raccoon, Cloud9, Team Secret, FURIA |
| Team B Score | int64 | 0.0% | 5, 9, 8, 11, 13 |
| Team B Attacker Score | int64 | 0.0% | 2, 3, 6, 8, 5 |
| Team B Defender Score | float64 | 0.0% | 3.0, 6.0, 5.0, 4.0, 8.0 |
| Team B Overtime Score | float64 | 91.4% | 0.0, 2.0, 3.0, 4.0, 1.0 |
| Duration | object | 0.6% | 59:11, 44:30, 59:48, 52:48, 59:50 |

### `vct_2021\matches\overview.csv`

- Rows: 599,355 | Columns: 21


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2021, Champions Tour North America: Last Ch..., Champions Tour South America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour Asia-Pacific: Last Cha... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, GCC and Iraq, Levant and North Africa |
| Match Type | object | 0.0% | Opening (D), Opening (C), Opening (B), Winner's (D), Opening (A) |
| Match Name | object | 0.0% | Vision Strikers vs FULL SENSE, Team Vikings vs Crazy Raccoon, FNATIC vs Cloud9, Gambit Esports vs Team Secret, Sentinels vs FURIA |
| Map | object | 0.0% | Haven, All Maps, Breeze, Icebox, Split |
| Player | object | 0.0% | MaKo, stax, Rb, k1Ng, BuZz |
| Team | object | 0.0% | Vision Strikers, FULL SENSE, Team Vikings, Crazy Raccoon, FNATIC |
| Agents | object | 0.0% | astra, breach, skye, killjoy, jett |
| Rating | float64 | 37.2% | 1.36, 1.38, 1.31, 1.34, 1.26 |
| Average Combat Score | float64 | 12.7% | 209.0, 211.0, 207.0, 262.0, 252.0 |
| Kills | float64 | 0.2% | 13.0, 9.0, 4.0, 22.0, 14.0 |
| Deaths | float64 | 0.2% | 8.0, 5.0, 3.0, 11.0, 7.0 |
| Assists | float64 | 0.2% | 6.0, 4.0, 2.0, 5.0, 1.0 |
| Kills - Deaths (KD) | float64 | 0.3% | 5.0, 4.0, 1.0, 11.0, 7.0 |
| Kill, Assist, Trade, Survive % | object | 37.3% | 78%, 75%, 83%, 92%, 50% |
| Average Damage Per Round | float64 | 13.0% | 154.0, 165.0, 132.0, 157.0, 140.0 |
| Headshot % | object | 1.2% | 24%, 18%, 42%, 53%, 50% |
| First Kills | float64 | 0.2% | 1.0, 0.0, 2.0, 4.0, 3.0 |
| First Deaths | float64 | 0.3% | 1.0, 0.0, 2.0, 3.0, 5.0 |
| Kills - Deaths (FKD) | float64 | 0.3% | 0.0, 1.0, -1.0, 2.0, -2.0 |
| Side | object | 0.0% | both, attack, defend |

### `vct_2021\matches\rounds_kills.csv`

- Rows: 788,047 | Columns: 13


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2021, Champions Tour North America: Last Ch..., Champions Tour South America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour Asia-Pacific: Last Cha... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, GCC and Iraq, Levant and North Africa |
| Match Type | object | 0.0% | Opening (D), Opening (C), Opening (B), Winner's (D), Opening (A) |
| Match Name | object | 0.0% | Vision Strikers vs FULL SENSE, Team Vikings vs Crazy Raccoon, FNATIC vs Cloud9, Gambit Esports vs Team Secret, Sentinels vs FURIA |
| Map | object | 0.0% | Haven, Breeze, Icebox, Split, Fracture |
| Round Number | int64 | 0.0% | 11, 12, 14, 2, 13 |
| Eliminator Team | object | 0.0% | Vision Strikers, FULL SENSE, Team Vikings, Crazy Raccoon, FNATIC |
| Eliminator | object | 0.1% | stax, Rb, k1Ng, BuZz, MaKo |
| Eliminator Agent | object | 0.0% | breach, skye, killjoy, jett, astra |
| Eliminated Team | object | 0.0% | FULL SENSE, Vision Strikers, Crazy Raccoon, Team Vikings, Cloud9 |
| Eliminated | object | 0.7% | PTC, JohnOlsen, LAMMYSNAX, SuperBusS, ChAlalala |
| Eliminated Agent | object | 0.0% | breach, jett, skye, astra, cypher |
| Kill Type | object | 0.0% | 2k, 3k, 1v2, 4k, 1v3 |

### `vct_2021\matches\scores.csv`

- Rows: 7,224 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2021, Champions Tour North America: Last Ch..., Champions Tour South America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour Asia-Pacific: Last Cha... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, GCC and Iraq, Levant and North Africa |
| Match Type | object | 0.0% | Opening (D), Opening (C), Opening (B), Winner's (D), Opening (A) |
| Match Name | object | 0.0% | Vision Strikers vs FULL SENSE, Team Vikings vs Crazy Raccoon, FNATIC vs Cloud9, Gambit Esports vs Team Secret, Sentinels vs FURIA |
| Team A | object | 0.0% | Vision Strikers, Team Vikings, FNATIC, Gambit Esports, Sentinels |
| Team B | object | 0.0% | FULL SENSE, Crazy Raccoon, Cloud9, Team Secret, FURIA |
| Team A Score | int64 | 0.0% | 2, 0, 1, 3, 13 |
| Team B Score | int64 | 0.0% | 0, 1, 2, 3, 13 |
| Match Result | object | 0.0% | Vision Strikers won, Team Vikings won, FNATIC won, Gambit Esports won, Sentinels won |

### `vct_2021\matches\team_mapping.csv`

- Rows: 2,377 | Columns: 2


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Abbreviated | object | 0.0% | VS, FS, VKS, CR, FNC |
| Full Name | object | 0.0% | Vision Strikers, FULL SENSE, Team Vikings, Carleton Ravens, FNATIC |

### `vct_2021\matches\win_loss_methods_count.csv`

- Rows: 28,972 | Columns: 14


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2021, Champions Tour North America: Last Ch..., Champions Tour South America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour Asia-Pacific: Last Cha... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, GCC and Iraq, Levant and North Africa |
| Match Type | object | 0.0% | Opening (D), Opening (C), Opening (B), Winner's (D), Opening (A) |
| Match Name | object | 0.0% | Vision Strikers vs FULL SENSE, Team Vikings vs Crazy Raccoon, FNATIC vs Cloud9, Gambit Esports vs Team Secret, Sentinels vs FURIA |
| Map | object | 0.0% | Haven, Breeze, Icebox, Split, Fracture |
| Team | object | 0.0% | Vision Strikers, FULL SENSE, Team Vikings, Crazy Raccoon, FNATIC |
| Elimination | int64 | 0.0% | 9, 4, 3, 7, 2 |
| Detonated | int64 | 0.0% | 2, 0, 3, 1, 4 |
| Defused | int64 | 0.0% | 2, 1, 3, 5, 6 |
| Time Expiry (No Plant) | int64 | 0.0% | 0, 1, 2, 3, 4 |
| Eliminated | int64 | 0.0% | 4, 9, 3, 2, 7 |
| Defused Failed | int64 | 0.0% | 0, 2, 3, 1, 4 |
| Detonation Denied | int64 | 0.0% | 1, 2, 5, 3, 4 |
| Time Expiry (Failed to Plant) | int64 | 0.0% | 0, 1, 2, 3, 4 |

### `vct_2021\matches\win_loss_methods_round_number.csv`

- Rows: 580,342 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2021, Champions Tour North America: Last Ch..., Champions Tour South America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour Asia-Pacific: Last Cha... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, GCC and Iraq, Levant and North Africa |
| Match Type | object | 0.0% | Opening (D), Opening (C), Opening (B), Winner's (D), Opening (A) |
| Match Name | object | 0.0% | Vision Strikers vs FULL SENSE, Team Vikings vs Crazy Raccoon, FNATIC vs Cloud9, Gambit Esports vs Team Secret, Sentinels vs FURIA |
| Map | object | 0.0% | Haven, Breeze, Icebox, Split, Fracture |
| Round Number | int64 | 0.0% | 1, 2, 3, 4, 5 |
| Team | object | 0.0% | Vision Strikers, FULL SENSE, Team Vikings, Crazy Raccoon, Cloud9 |
| Method | object | 0.0% | Elimination, Eliminated, Detonated, Failed Defused, Defused |
| Outcome | object | 0.0% | Win, Loss |

### `vct_2021\players_stats\players_stats.csv`

- Rows: 194,966 | Columns: 25


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Champions Tour North America: Last Ch..., Strike Arabia Championship: Finals, Champions Tour EMEA: Last Chance Qual..., Champions Tour South America: Last Ch..., Oceania Tour: Championship |
| Stage | object | 0.0% | Main Event, All Stages, Playoffs, Group Stage, Levant and North Africa |
| Match Type | object | 0.0% | Upper Quarterfinals, Upper Semifinals, Upper Final, Grand Final, Lower Round 1 |
| Player | object | 0.0% | Ethan, Asuna, b0i, Hiko, nitr0 |
| Teams | object | 0.0% | 100 Thieves, Rise, Gen.G, Luminosity, FaZe Clan |
| Agents | object | 0.0% | skye, sage, sage, skye, reyna, raze |
| Rounds Played | int64 | 0.0% | 44, 17, 61, 40, 21 |
| Rating | float64 | 35.2% | 1.29, 1.17, 1.25, 1.27, 1.13 |
| Average Combat Score | float64 | 0.0% | 236.0, 197.0, 223.0, 257.0, 267.0 |
| Kills:Deaths | float64 | 0.0% | 1.5, 1.3, 1.44, 1.48, 1.29 |
| Kill, Assist, Trade, Survive % | object | 35.2% | 75%, 82%, 77%, 83%, 81% |
| Average Damage Per Round | float64 | 0.1% | 146.0, 124.0, 140.0, 178.0, 184.0 |
| Kills Per Round | float64 | 0.0% | 0.89, 0.76, 0.85, 0.93, 0.86 |
| Assists Per Round | float64 | 0.0% | 0.36, 0.24, 0.33, 0.48, 0.38 |
| First Kills Per Round | float64 | 0.0% | 0.07, 0.06, 0.08, 0.1, 0.0 |
| First Deaths Per Round | float64 | 0.1% | 0.11, 0.06, 0.1, 0.18, 0.14 |
| Headshot % | object | 0.2% | 31%, 24%, 29%, 11%, 22% |
| Clutch Success % | object | 7.4% | 20%, 50%, 0%, 100%, 67% |
| Clutches (won/played) | object | 7.4% | 1/5, 1/2, 0/4, 0/8, 0/2 |
| Maximum Kills in a Single Map | int64 | 0.0% | 29, 13, 23, 18, 7 |
| Kills | int64 | 0.0% | 39, 13, 52, 37, 18 |
| Deaths | int64 | 0.0% | 26, 10, 36, 25, 14 |
| Assists | int64 | 0.0% | 16, 4, 20, 13, 10 |
| First Kills | int64 | 0.0% | 3, 1, 4, 2, 5 |
| First Deaths | int64 | 0.0% | 5, 1, 6, 7, 3 |

## vct_2022


### `vct_2022\agents\agents_pick_rates.csv`

- Rows: 132,336 | Columns: 6


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Champions Tour South America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour East Asia: Last Chance..., Champions Tour North America: Last Ch..., Valorant Champions 2022 |
| Stage | object | 0.0% | Main Event, All Stages, Playoffs, Group Stage, Decider |
| Match Type | object | 0.0% | Upper Quarterfinals, Upper Semifinals, Upper Final, Lower Round 1, Lower Round 2 |
| Map | object | 0.0% | All Maps, Ascent, Fracture, Haven, Bind |
| Agent | object | 0.0% | chamber, fade, kayo, raze, omen |
| Pick Rate | object | 0.0% | 80%, 50%, 45%, 40%, 35% |

### `vct_2022\agents\maps_stats.csv`

- Rows: 5,514 | Columns: 7


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Champions Tour South America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour East Asia: Last Chance..., Champions Tour North America: Last Ch..., Valorant Champions 2022 |
| Stage | object | 0.0% | Main Event, All Stages, Playoffs, Group Stage, Decider |
| Match Type | object | 0.0% | Upper Quarterfinals, Upper Semifinals, Upper Final, Lower Round 1, Lower Round 2 |
| Map | object | 0.0% | All Maps, Ascent, Fracture, Haven, Bind |
| Total Maps Played | int64 | 0.0% | 10, 3, 2, 1, 4 |
| Attacker Side Win Percentage | object | 0.0% | 52%, 48%, 54%, 58%, 50% |
| Defender Side Win Percentage | object | 0.0% | 48%, 52%, 46%, 42%, 50% |

### `vct_2022\agents\teams_picked_agents.csv`

- Rows: 131,546 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Champions Tour South America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour East Asia: Last Chance..., Champions Tour North America: Last Ch..., Valorant Champions 2022 |
| Stage | object | 0.0% | Main Event, All Stages, Playoffs, Group Stage, Decider |
| Match Type | object | 0.0% | Upper Quarterfinals, Upper Semifinals, Upper Final, Lower Round 1, Lower Round 2 |
| Map | object | 0.0% | Haven, Ascent, Fracture, Breeze, Bind |
| Team | object | 0.0% | Ninjas In Pyjamas, 9z Team, KRÜ Esports, TBK Esports, FUSION |
| Agent | object | 0.0% | chamber, kayo, omen, neon, skye |
| Total Wins By Map | int64 | 0.0% | 0, 1, 2, 3, 4 |
| Total Loss By Map | int64 | 0.0% | 1, 0, 2, 3, 4 |
| Total Maps Played | int64 | 0.0% | 1, 3, 2, 4, 5 |

### `vct_2022\ids\players_ids.csv`

- Rows: 7,568 | Columns: 2


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Player | object | 0.0% | Benkai, d4v41, mindfreak, f0rsakeN, Jinggg |
| Player ID | float64 | 0.0% | 9802.0, 9803.0, 9800.0, 9801.0, 7378.0 |

### `vct_2022\ids\teams_ids.csv`

- Rows: 1,572 | Columns: 2


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Team | object | 0.0% | Paper Rex, EDward Gaming, LEVIATÁN, Team Liquid, ZETA DIVISION |
| Team ID | int64 | 0.0% | 624, 1120, 2359, 474, 5448 |

### `vct_2022\ids\tournaments_stages_match_types_ids.csv`

- Rows: 1,076 | Columns: 6


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Champions Tour South America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour East Asia: Last Chance..., Champions Tour North America: Last Ch..., Valorant Champions 2022 |
| Tournament ID | int64 | 0.0% | 1111, 1117, 1083, 1130, 1015 |
| Stage | object | 0.0% | Main Event, All Stages, Playoffs, Group Stage, Decider |
| Stage ID | float64 | 5.4% | 2154.0, 2163.0, 2130.0, 2190.0, 2184.0 |
| Match Type | object | 0.0% | Upper Quarterfinals, Upper Semifinals, Upper Final, Lower Round 1, Lower Round 2 |
| Match Type ID | float64 | 5.4% | 13253.0, 13254.0, 13255.0, 13256.0, 13257.0 |

### `vct_2022\ids\tournaments_stages_matches_games_ids.csv`

- Rows: 8,864 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2022, Champions Tour South America: Last Ch..., Champions Tour North America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour East Asia: Last Chance... |
| Tournament ID | int64 | 0.0% | 1015, 1111, 1130, 1117, 1083 |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, Decider, Open Qualifier #1 |
| Stage ID | int64 | 0.0% | 2183, 2184, 2154, 2190, 2163 |
| Match Type | object | 0.0% | Opening (A), Opening (B), Winner's (A), Opening (D), Winner's (B) |
| Match Name | object | 0.0% | Paper Rex vs EDward Gaming, LEVIATÁN vs Team Liquid, ZETA DIVISION vs LOUD, OpTic Gaming vs BOOM Esports, Paper Rex vs LEVIATÁN |
| Match ID | int64 | 0.0% | 130617, 130618, 130623, 130622, 130619 |
| Map | object | 0.0% | Pearl, Icebox, Haven, Ascent, Fracture |
| Game ID | int64 | 0.0% | 95029, 95030, 95031, 95032, 95033 |

### `vct_2022\matches\draft_phase.csv`

- Rows: 7,432 | Columns: 7


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2022, Champions Tour South America: Last Ch..., Champions Tour North America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour East Asia: Last Chance... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, Decider, Open Qualifier #1 |
| Match Type | object | 0.0% | Opening (A), Opening (B), Winner's (A), Opening (D), Winner's (B) |
| Match Name | object | 0.0% | Paper Rex vs EDward Gaming, LEVIATÁN vs Team Liquid, ZETA DIVISION vs LOUD, OpTic Gaming vs BOOM Esports, Paper Rex vs LEVIATÁN |
| Team | object | 0.0% | EDward Gaming, Paper Rex, Team Liquid, LEVIATÁN, LOUD |
| Action | object | 0.0% | ban, pick |
| Map | object | 0.0% | Bind, Fracture, Pearl, Icebox, Ascent |

### `vct_2022\matches\eco_rounds.csv`

- Rows: 358,798 | Columns: 11


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2022, Champions Tour South America: Last Ch..., Champions Tour North America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour East Asia: Last Chance... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, Decider, Open Qualifier #1 |
| Match Type | object | 0.0% | Opening (A), Opening (B), Winner's (A), Opening (D), Winner's (B) |
| Match Name | object | 0.0% | Paper Rex vs EDward Gaming, LEVIATÁN vs Team Liquid, ZETA DIVISION vs LOUD, OpTic Gaming vs BOOM Esports, Paper Rex vs LEVIATÁN |
| Map | object | 0.0% | Pearl, Icebox, Haven, Ascent, Fracture |
| Round Number | int64 | 0.0% | 1, 2, 3, 4, 5 |
| Team | object | 0.0% | Paper Rex, EDward Gaming, LEVIATÁN, Team Liquid, ZETA DIVISION |
| Loadout Value | object | 0.0% | 3.7k, 4.0k, 1.2k, 15.6k, 21.3k |
| Remaining Credits | object | 0.0% | 0.1k, 0.2k, 9.6k, 2.4k, 0.7k |
| Type | object | 0.0% | Eco: 0-5k, Semi-buy: 10-20k, Full buy: 20k+, Semi-eco: 5-10k |
| Outcome | object | 0.0% | Loss, Win |

### `vct_2022\matches\eco_stats.csv`

- Rows: 126,110 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2022, Champions Tour South America: Last Ch..., Champions Tour North America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour East Asia: Last Chance... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, Decider, Open Qualifier #1 |
| Match Type | object | 0.0% | Opening (A), Opening (B), Winner's (A), Opening (D), Winner's (B) |
| Match Name | object | 0.0% | Paper Rex vs EDward Gaming, LEVIATÁN vs Team Liquid, ZETA DIVISION vs LOUD, OpTic Gaming vs BOOM Esports, Paper Rex vs LEVIATÁN |
| Map | object | 0.0% | Pearl, Icebox, Haven, All Maps, Ascent |
| Team | object | 0.0% | Paper Rex, EDward Gaming, LEVIATÁN, Team Liquid, ZETA DIVISION |
| Type | object | 0.0% | Pistol Won, Eco (won), $ (won), $$ (won), $$$ (won) |
| Initiated | float64 | 20.0% | 3.0, 2.0, 8.0, 11.0, 6.0 |
| Won | int64 | 0.0% | 1, 5, 6, 4, 0 |

### `vct_2022\matches\kills.csv`

- Rows: 945,825 | Columns: 13


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2022, Champions Tour South America: Last Ch..., Champions Tour North America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour East Asia: Last Chance... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, Decider, Open Qualifier #1 |
| Match Type | object | 0.0% | Opening (A), Opening (B), Winner's (A), Opening (D), Winner's (B) |
| Match Name | object | 0.0% | Paper Rex vs EDward Gaming, LEVIATÁN vs Team Liquid, ZETA DIVISION vs LOUD, OpTic Gaming vs BOOM Esports, Paper Rex vs LEVIATÁN |
| Map | object | 0.0% | All Maps, Pearl, Icebox, Haven, Ascent |
| Player Team | object | 0.0% | Paper Rex, LEVIATÁN, ZETA DIVISION, OpTic Gaming, DRX |
| Player | object | 0.1% | d4v41, f0rsakeN, mindfreak, Jinggg, Benkai |
| Enemy Team | object | 0.0% | EDward Gaming, Team Liquid, LOUD, BOOM Esports, LEVIATÁN |
| Enemy | object | 0.0% | Haodong, nobody, CHICHOO, ZmjjKK, Smoggy |
| Player Kills | float64 | 40.2% | 8.0, 12.0, 6.0, 9.0, 10.0 |
| Enemy Kills | float64 | 40.2% | 8.0, 9.0, 10.0, 12.0, 7.0 |
| Difference | float64 | 40.7% | 0.0, 3.0, -4.0, 2.0, 1.0 |
| Kill Type | object | 0.0% | All Kills, First Kills, Op Kills |

### `vct_2022\matches\kills_stats.csv`

- Rows: 126,337 | Columns: 20


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2022, Champions Tour South America: Last Ch..., Champions Tour North America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour East Asia: Last Chance... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, Decider, Open Qualifier #1 |
| Match Type | object | 0.0% | Opening (A), Opening (B), Winner's (A), Opening (D), Winner's (B) |
| Match Name | object | 0.0% | Paper Rex vs EDward Gaming, LEVIATÁN vs Team Liquid, ZETA DIVISION vs LOUD, OpTic Gaming vs BOOM Esports, Paper Rex vs LEVIATÁN |
| Map | object | 0.0% | All Maps, Pearl, Icebox, Haven, Ascent |
| Team | object | 0.0% | Paper Rex, EDward Gaming, LEVIATÁN, Team Liquid, ZETA DIVISION |
| Player | object | 0.0% | Jinggg, mindfreak, f0rsakeN, Benkai, d4v41 |
| Agents | object | 0.0% | raze, reyna, sage, astra, viper, chamber, jett, cypher, fade, chamber, sage, skye |
| 2k | float64 | 6.9% | 13.0, 4.0, 9.0, 5.0, 7.0 |
| 3k | float64 | 38.9% | 3.0, 1.0, 4.0, 2.0, 8.0 |
| 4k | float64 | 80.4% | 1.0, 2.0, 3.0, 4.0, 5.0 |
| 5k | float64 | 97.5% | 1.0, 2.0, 3.0, 4.0 |
| 1v1 | float64 | 76.9% | 1.0, 2.0, 3.0, 4.0, 7.0 |
| 1v2 | float64 | 87.2% | 1.0, 2.0, 3.0, 4.0 |
| 1v3 | float64 | 96.4% | 1.0, 2.0 |
| 1v4 | float64 | 99.3% | 1.0, 2.0 |
| 1v5 | float64 | 99.9% | 1.0 |
| Econ | int64 | 0.0% | 59, 48, 56, 47, 67 |
| Spike Plants | int64 | 0.0% | 1, 2, 3, 4, 7 |
| Spike Defuses | int64 | 0.0% | 0, 1, 3, 2, 5 |

### `vct_2022\matches\maps_played.csv`

- Rows: 8,864 | Columns: 5


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2022, Champions Tour South America: Last Ch..., Champions Tour North America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour East Asia: Last Chance... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, Decider, Open Qualifier #1 |
| Match Type | object | 0.0% | Opening (A), Opening (B), Winner's (A), Opening (D), Winner's (B) |
| Match Name | object | 0.0% | Paper Rex vs EDward Gaming, LEVIATÁN vs Team Liquid, ZETA DIVISION vs LOUD, OpTic Gaming vs BOOM Esports, Paper Rex vs LEVIATÁN |
| Map | object | 0.0% | Pearl, Icebox, Haven, Ascent, Fracture |

### `vct_2022\matches\maps_scores.csv`

- Rows: 8,884 | Columns: 16


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2022, Champions Tour South America: Last Ch..., Champions Tour North America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour East Asia: Last Chance... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, Decider, Open Qualifier #1 |
| Match Type | object | 0.0% | Opening (A), Opening (B), Winner's (A), Opening (D), Winner's (B) |
| Match Name | object | 0.0% | Paper Rex vs EDward Gaming, LEVIATÁN vs Team Liquid, ZETA DIVISION vs LOUD, OpTic Gaming vs BOOM Esports, Paper Rex vs LEVIATÁN |
| Map | object | 0.2% | Pearl, Icebox, Haven, Ascent, Fracture |
| Team A | object | 0.0% | Paper Rex, LEVIATÁN, ZETA DIVISION, OpTic Gaming, DRX |
| Team A Score | int64 | 0.0% | 13, 5, 8, 9, 16 |
| Team A Attacker Score | int64 | 0.0% | 6, 2, 7, 8, 4 |
| Team A Defender Score | int64 | 0.0% | 7, 3, 6, 5, 1 |
| Team A Overtime Score | float64 | 91.1% | 4.0, 2.0, 6.0, 0.0, 1.0 |
| Team B | object | 0.0% | EDward Gaming, Team Liquid, LOUD, BOOM Esports, LEVIATÁN |
| Team B Score | int64 | 0.0% | 11, 13, 8, 10, 18 |
| Team B Attacker Score | int64 | 0.0% | 5, 3, 6, 4, 8 |
| Team B Defender Score | int64 | 0.0% | 6, 10, 5, 4, 8 |
| Team B Overtime Score | float64 | 91.1% | 6.0, 2.0, 0.0, 4.0, 3.0 |
| Duration | object | 0.6% | 1:16:34, 40:51, 45:32, 1:04:37, 1:05:07 |

### `vct_2022\matches\overview.csv`

- Rows: 379,378 | Columns: 21


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2022, Champions Tour South America: Last Ch..., Champions Tour North America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour East Asia: Last Chance... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, Decider, Open Qualifier #1 |
| Match Type | object | 0.0% | Opening (A), Opening (B), Winner's (A), Opening (D), Winner's (B) |
| Match Name | object | 0.0% | Paper Rex vs EDward Gaming, LEVIATÁN vs Team Liquid, ZETA DIVISION vs LOUD, OpTic Gaming vs BOOM Esports, Paper Rex vs LEVIATÁN |
| Map | object | 0.0% | Pearl, All Maps, Icebox, Haven, Ascent |
| Player | object | 0.0% | Benkai, d4v41, mindfreak, f0rsakeN, Jinggg |
| Team | object | 0.0% | Paper Rex, EDward Gaming, LEVIATÁN, Team Liquid, ZETA DIVISION |
| Agents | object | 0.0% | fade, sage, astra, chamber, raze |
| Rating | float64 | 0.2% | 1.31, 1.18, 1.45, 1.15, 1.04 |
| Average Combat Score | float64 | 0.2% | 242.0, 243.0, 219.0, 222.0, 216.0 |
| Kills | float64 | 0.1% | 22.0, 11.0, 20.0, 10.0, 16.0 |
| Deaths | float64 | 0.1% | 16.0, 9.0, 7.0, 19.0, 10.0 |
| Assists | float64 | 0.1% | 13.0, 5.0, 8.0, 7.0, 4.0 |
| Kills - Deaths (KD) | float64 | 0.2% | 6.0, 2.0, 4.0, 1.0, 3.0 |
| Kill, Assist, Trade, Survive % | object | 0.3% | 88%, 75%, 100%, 83%, 92% |
| Average Damage Per Round | float64 | 0.3% | 156.0, 167.0, 146.0, 140.0, 147.0 |
| Headshot % | object | 0.4% | 34%, 32%, 35%, 33%, 29% |
| First Kills | float64 | 0.1% | 1.0, 0.0, 2.0, 3.0, 8.0 |
| First Deaths | float64 | 0.1% | 0.0, 4.0, 2.0, 5.0, 3.0 |
| Kills - Deaths (FKD) | float64 | 0.1% | 1.0, 0.0, -4.0, -2.0, -1.0 |
| Side | object | 0.0% | both, attack, defend |

### `vct_2022\matches\rounds_kills.csv`

- Rows: 776,476 | Columns: 13


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2022, Champions Tour South America: Last Ch..., Champions Tour North America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour East Asia: Last Chance... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, Decider, Open Qualifier #1 |
| Match Type | object | 0.0% | Opening (A), Opening (B), Winner's (A), Opening (D), Winner's (B) |
| Match Name | object | 0.0% | Paper Rex vs EDward Gaming, LEVIATÁN vs Team Liquid, ZETA DIVISION vs LOUD, OpTic Gaming vs BOOM Esports, Paper Rex vs LEVIATÁN |
| Map | object | 0.0% | Pearl, Icebox, Haven, Ascent, Fracture |
| Round Number | int64 | 0.0% | 2, 11, 14, 17, 18 |
| Eliminator Team | object | 0.0% | Paper Rex, EDward Gaming, LEVIATÁN, Team Liquid, ZETA DIVISION |
| Eliminator | object | 0.0% | Jinggg, mindfreak, f0rsakeN, Benkai, d4v41 |
| Eliminator Agent | object | 0.0% | raze, astra, chamber, fade, sage |
| Eliminated Team | object | 0.0% | EDward Gaming, Paper Rex, Team Liquid, LEVIATÁN, LOUD |
| Eliminated | object | 0.1% | Smoggy, ZmjjKK, Haodong, CHICHOO, nobody |
| Eliminated Agent | object | 0.0% | kayo, chamber, astra, viper, fade |
| Kill Type | object | 0.0% | 2k, 3k, 4k, 1v5, 1v1 |

### `vct_2022\matches\scores.csv`

- Rows: 3,842 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2022, Champions Tour South America: Last Ch..., Champions Tour North America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour East Asia: Last Chance... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, Decider, Open Qualifier #1 |
| Match Type | object | 0.0% | Opening (A), Opening (B), Winner's (A), Opening (D), Winner's (B) |
| Match Name | object | 0.0% | Paper Rex vs EDward Gaming, LEVIATÁN vs Team Liquid, ZETA DIVISION vs LOUD, OpTic Gaming vs BOOM Esports, Paper Rex vs LEVIATÁN |
| Team A | object | 0.0% | Paper Rex, LEVIATÁN, ZETA DIVISION, OpTic Gaming, DRX |
| Team B | object | 0.0% | EDward Gaming, Team Liquid, LOUD, BOOM Esports, LEVIATÁN |
| Team A Score | int64 | 0.0% | 2, 0, 1, 3, 14 |
| Team B Score | int64 | 0.0% | 1, 0, 2, 3, 12 |
| Match Result | object | 0.0% | Paper Rex won, Leviatán won, LOUD won, OpTic Gaming won, DRX won |

### `vct_2022\matches\team_mapping.csv`

- Rows: 1,399 | Columns: 2


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Abbreviated | object | 0.1% | PRX, EDG, LEV, TL, ZETA |
| Full Name | object | 0.0% | Paper Rex, EDward Gaming, Leviatán, Team Liquid, ZETA DIVISION |

### `vct_2022\matches\win_loss_methods_count.csv`

- Rows: 17,728 | Columns: 14


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2022, Champions Tour South America: Last Ch..., Champions Tour North America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour East Asia: Last Chance... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, Decider, Open Qualifier #1 |
| Match Type | object | 0.0% | Opening (A), Opening (B), Winner's (A), Opening (D), Winner's (B) |
| Match Name | object | 0.0% | Paper Rex vs EDward Gaming, LEVIATÁN vs Team Liquid, ZETA DIVISION vs LOUD, OpTic Gaming vs BOOM Esports, Paper Rex vs LEVIATÁN |
| Map | object | 0.0% | Pearl, Icebox, Haven, Ascent, Fracture |
| Team | object | 0.0% | Paper Rex, EDward Gaming, LEVIATÁN, Team Liquid, ZETA DIVISION |
| Elimination | int64 | 0.0% | 11, 7, 5, 9, 8 |
| Detonated | int64 | 0.0% | 0, 1, 2, 4, 3 |
| Defused | int64 | 0.0% | 1, 3, 0, 5, 2 |
| Time Expiry (No Plant) | int64 | 0.0% | 1, 0, 2, 3, 4 |
| Eliminated | int64 | 0.0% | 7, 11, 5, 9, 6 |
| Defused Failed | int64 | 0.0% | 1, 0, 2, 4, 3 |
| Detonation Denied | int64 | 0.0% | 3, 1, 0, 2, 5 |
| Time Expiry (Failed to Plant) | int64 | 0.0% | 0, 1, 3, 2, 4 |

### `vct_2022\matches\win_loss_methods_round_number.csv`

- Rows: 359,210 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2022, Champions Tour South America: Last Ch..., Champions Tour North America: Last Ch..., Champions Tour EMEA: Last Chance Qual..., Champions Tour East Asia: Last Chance... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, Decider, Open Qualifier #1 |
| Match Type | object | 0.0% | Opening (A), Opening (B), Winner's (A), Opening (D), Winner's (B) |
| Match Name | object | 0.0% | Paper Rex vs EDward Gaming, LEVIATÁN vs Team Liquid, ZETA DIVISION vs LOUD, OpTic Gaming vs BOOM Esports, Paper Rex vs LEVIATÁN |
| Map | object | 0.0% | Pearl, Icebox, Haven, Ascent, Fracture |
| Round Number | int64 | 0.0% | 1, 2, 3, 4, 5 |
| Team | object | 0.0% | EDward Gaming, Paper Rex, LEVIATÁN, Team Liquid, ZETA DIVISION |
| Method | object | 0.0% | Elimination, Eliminated, Defused, Detonated Denied, Detonated |
| Outcome | object | 0.0% | Win, Loss |

### `vct_2022\players_stats\players_stats.csv`

- Rows: 126,641 | Columns: 25


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Champions Tour LATAM/BR Stage 2: Last..., Champions Tour North America: Last Ch..., Oceania Tour: Championship, Champions Tour Latin America Stage 2:..., Champions Tour EMEA: Last Chance Qual... |
| Stage | object | 0.0% | Decider, All Stages, Main Event, Playoffs, Group Stage |
| Match Type | object | 0.0% | Decider, All Match Types, Upper Quarterfinals, Upper Semifinals, Upper Final |
| Player | object | 0.0% | xand, v1xen, bezn1, Jonn, cauanzin |
| Teams | object | 0.0% | Ninjas In Pyjamas, KRÜ Esports, 100 Thieves, The Guard, Shopify Rebellion |
| Agents | object | 0.0% | killjoy, chamber, kayo, chamber, kayo, killjoy, viper |
| Rounds Played | int64 | 0.0% | 23, 18, 21, 62, 44 |
| Rating | float64 | 0.1% | 0.92, 0.55, 1.07, 0.85, 0.9 |
| Average Combat Score | float64 | 0.0% | 227.0, 175.0, 191.0, 198.0, 212.0 |
| Kills:Deaths | float64 | 0.0% | 1.25, 0.59, 0.82, 0.88, 0.94 |
| Kill, Assist, Trade, Survive % | object | 0.1% | 74%, 44%, 81%, 68%, 66% |
| Average Damage Per Round | float64 | 0.1% | 138.0, 104.0, 133.0, 127.0, 126.0 |
| Kills Per Round | float64 | 0.0% | 0.87, 0.56, 0.67, 0.71, 0.73 |
| Assists Per Round | float64 | 0.0% | 0.09, 0.11, 0.33, 0.18, 0.34 |
| First Kills Per Round | float64 | 0.0% | 0.0, 0.11, 0.14, 0.08, 0.02 |
| First Deaths Per Round | float64 | 0.1% | 0.13, 0.22, 0.0, 0.11, 0.09 |
| Headshot % | object | 0.1% | 23%, 35%, 26%, 19%, 17% |
| Clutch Success % | object | 7.4% | 0%, 67%, 18%, 27%, 50% |
| Clutches (won/played) | object | 7.4% | 0/6, 0/2, 2/3, 2/11, 3/11 |
| Maximum Kills in a Single Map | int64 | 0.0% | 20, 10, 14, 7, 9 |
| Kills | int64 | 0.0% | 20, 10, 14, 44, 32 |
| Deaths | int64 | 0.0% | 16, 17, 50, 34, 15 |
| Assists | int64 | 0.0% | 2, 7, 11, 15, 4 |
| First Kills | int64 | 0.0% | 0, 2, 3, 5, 1 |
| First Deaths | int64 | 0.0% | 3, 4, 0, 7, 1 |

## vct_2023


### `vct_2023\agents\agents_pick_rates.csv`

- Rows: 17,712 | Columns: 6


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Champions Tour 2023: Americas Last Ch..., Champions Tour 2023: Pacific Last Cha..., Champions Tour 2023: EMEA Last Chance..., Valorant Champions 2023, Champions Tour 2023: Champions China ... |
| Stage | object | 0.0% | Main Event, All Stages, Playoffs, Group Stage, Preliminary Stage |
| Match Type | object | 0.0% | Upper Round 1, Upper Quarterfinals, Upper Semifinals, Upper Final, Grand Final |
| Map | object | 0.0% | All Maps, Bind, Lotus, Split, Ascent |
| Agent | object | 0.0% | viper, skye, raze, killjoy, brimstone |
| Pick Rate | object | 0.0% | 100%, 50%, 25%, 0%, 75% |

### `vct_2023\agents\maps_stats.csv`

- Rows: 738 | Columns: 7


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Champions Tour 2023: Americas Last Ch..., Champions Tour 2023: Pacific Last Cha..., Champions Tour 2023: EMEA Last Chance..., Valorant Champions 2023, Champions Tour 2023: Champions China ... |
| Stage | object | 0.0% | Main Event, All Stages, Playoffs, Group Stage, Preliminary Stage |
| Match Type | object | 0.0% | Upper Round 1, Upper Quarterfinals, Upper Semifinals, Upper Final, Grand Final |
| Map | object | 0.0% | All Maps, Bind, Lotus, Split, Ascent |
| Total Maps Played | int64 | 0.0% | 2, 1, 6, 5, 3 |
| Attacker Side Win Percentage | object | 0.0% | 51%, 35%, 67%, 46%, 55% |
| Defender Side Win Percentage | object | 0.0% | 49%, 65%, 33%, 54%, 45% |

### `vct_2023\agents\teams_picked_agents.csv`

- Rows: 11,751 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Champions Tour 2023: Americas Last Ch..., Champions Tour 2023: Pacific Last Cha..., Champions Tour 2023: EMEA Last Chance..., Valorant Champions 2023, Champions Tour 2023: Champions China ... |
| Stage | object | 0.0% | Main Event, All Stages, Playoffs, Group Stage, Preliminary Stage |
| Match Type | object | 0.0% | Upper Round 1, Upper Quarterfinals, Upper Semifinals, Upper Final, Grand Final |
| Map | object | 0.0% | Bind, Lotus, Pearl, Split, Ascent |
| Team | object | 0.0% | MIBR, KRÜ Esports, Sentinels, 100 Thieves, FURIA |
| Agent | object | 0.0% | viper, skye, raze, brimstone, chamber |
| Total Wins By Map | int64 | 0.0% | 0, 1, 2, 3, 4 |
| Total Loss By Map | int64 | 0.0% | 1, 0, 3, 2, 4 |
| Total Maps Played | int64 | 0.0% | 1, 2, 3, 4, 5 |

### `vct_2023\ids\players_ids.csv`

- Rows: 284 | Columns: 2


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Player | object | 0.0% | nAts, Sayf, soulcas, Jamppi, Redgar |
| Player ID | int64 | 0.0% | 457, 312, 101, 9780, 1427 |

### `vct_2023\ids\teams_ids.csv`

- Rows: 51 | Columns: 2


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Team | object | 0.0% | Team Liquid, Natus Vincere, DRX, LOUD, FUT Esports |
| Team ID | int64 | 0.0% | 474, 4915, 8185, 6961, 1184 |

### `vct_2023\ids\tournaments_stages_match_types_ids.csv`

- Rows: 137 | Columns: 6


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Champions Tour 2023: Americas Last Ch..., Champions Tour 2023: Pacific Last Cha..., Champions Tour 2023: EMEA Last Chance..., Valorant Champions 2023, Champions Tour 2023: Champions China ... |
| Tournament ID | int64 | 0.0% | 1658, 1660, 1659, 1657, 1664 |
| Stage | object | 0.0% | Main Event, All Stages, Playoffs, Group Stage, Preliminary Stage |
| Stage ID | float64 | 7.3% | 3146.0, 3148.0, 3147.0, 3264.0, 3145.0 |
| Match Type | object | 0.0% | Upper Round 1, Upper Quarterfinals, Upper Semifinals, Upper Final, Grand Final |
| Match Type ID | float64 | 7.3% | 19693.0, 19694.0, 19695.0, 19696.0, 19697.0 |

### `vct_2023\ids\tournaments_stages_matches_games_ids.csv`

- Rows: 830 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2023, Champions Tour 2023: Americas Last Ch..., Champions Tour 2023: EMEA Last Chance..., Champions Tour 2023: Pacific Last Cha..., Champions Tour 2023: Champions China ... |
| Tournament ID | int64 | 0.0% | 1657, 1658, 1659, 1660, 1664 |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, Preliminary Stage, Regular Season |
| Stage ID | int64 | 0.0% | 3145, 3264, 3146, 3147, 3148 |
| Match Type | object | 0.0% | Opening (D), Opening (B), Winner's (D), Opening (C), Winner's (B) |
| Match Name | object | 0.0% | Team Liquid vs Natus Vincere, DRX vs LOUD, FUT Esports vs T1, Evil Geniuses vs FunPlus Phoenix, Natus Vincere vs DRX |
| Match ID | int64 | 0.0% | 247100, 247101, 247087, 247086, 247102 |
| Map | object | 0.0% | Fracture, Bind, Lotus, Split, Ascent |
| Game ID | int64 | 0.0% | 137395, 137396, 137398, 137399, 137400 |

### `vct_2023\matches\draft_phase.csv`

- Rows: 1,898 | Columns: 7


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2023, Champions Tour 2023: Americas Last Ch..., Champions Tour 2023: EMEA Last Chance..., Champions Tour 2023: Pacific Last Cha..., Champions Tour 2023: Champions China ... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, Preliminary Stage, Regular Season |
| Match Type | object | 0.0% | Opening (D), Opening (B), Winner's (D), Opening (C), Winner's (B) |
| Match Name | object | 0.0% | Team Liquid vs Natus Vincere, DRX vs LOUD, FUT Esports vs T1, Evil Geniuses vs FunPlus Phoenix, Natus Vincere vs DRX |
| Team | object | 0.0% | Natus Vincere, Team Liquid, LOUD, DRX, T1 |
| Action | object | 0.0% | ban, pick |
| Map | object | 0.0% | Haven, Pearl, Fracture, Bind, Lotus |

### `vct_2023\matches\eco_rounds.csv`

- Rows: 33,032 | Columns: 11


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2023, Champions Tour 2023: Americas Last Ch..., Champions Tour 2023: EMEA Last Chance..., Champions Tour 2023: Pacific Last Cha..., Champions Tour 2023: Champions China ... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, Preliminary Stage, Regular Season |
| Match Type | object | 0.0% | Opening (D), Opening (B), Winner's (D), Opening (C), Winner's (B) |
| Match Name | object | 0.0% | Team Liquid vs Natus Vincere, DRX vs LOUD, FUT Esports vs T1, Evil Geniuses vs FunPlus Phoenix, Natus Vincere vs DRX |
| Map | object | 0.0% | Fracture, Bind, Lotus, Split, Ascent |
| Round Number | int64 | 0.0% | 1, 2, 3, 4, 5 |
| Team | object | 0.0% | Team Liquid, Natus Vincere, DRX, LOUD, FUT Esports |
| Loadout Value | object | 0.0% | 3.6k, 3.5k, 15.6k, 4.2k, 13.3k |
| Remaining Credits | object | 0.0% | 0.4k, 0.3k, 4.1k, 6.4k, 14.8k |
| Type | object | 0.0% | Eco: 0-5k, Semi-buy: 10-20k, Full buy: 20k+, Semi-eco: 5-10k |
| Outcome | object | 0.0% | Win, Loss |

### `vct_2023\matches\eco_stats.csv`

- Rows: 10,830 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2023, Champions Tour 2023: Americas Last Ch..., Champions Tour 2023: EMEA Last Chance..., Champions Tour 2023: Pacific Last Cha..., Champions Tour 2023: Champions China ... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, Preliminary Stage, Regular Season |
| Match Type | object | 0.0% | Opening (D), Opening (B), Winner's (D), Opening (C), Winner's (B) |
| Match Name | object | 0.0% | Team Liquid vs Natus Vincere, DRX vs LOUD, FUT Esports vs T1, Evil Geniuses vs FunPlus Phoenix, Natus Vincere vs DRX |
| Map | object | 0.0% | Fracture, Bind, All Maps, Lotus, Split |
| Team | object | 0.0% | Team Liquid, Natus Vincere, DRX, LOUD, FUT Esports |
| Type | object | 0.0% | Pistol Won, Eco (won), $ (won), $$ (won), $$$ (won) |
| Initiated | float64 | 20.0% | 2.0, 8.0, 12.0, 4.0, 1.0 |
| Won | int64 | 0.0% | 2, 0, 4, 5, 3 |

### `vct_2023\matches\kills.csv`

- Rows: 81,225 | Columns: 13


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2023, Champions Tour 2023: Americas Last Ch..., Champions Tour 2023: EMEA Last Chance..., Champions Tour 2023: Pacific Last Cha..., Champions Tour 2023: Champions China ... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, Preliminary Stage, Regular Season |
| Match Type | object | 0.0% | Opening (D), Opening (B), Winner's (D), Opening (C), Winner's (B) |
| Match Name | object | 0.0% | Team Liquid vs Natus Vincere, DRX vs LOUD, FUT Esports vs T1, Evil Geniuses vs FunPlus Phoenix, Natus Vincere vs DRX |
| Map | object | 0.0% | All Maps, Fracture, Bind, Lotus, Split |
| Player Team | object | 0.0% | Team Liquid, DRX, FUT Esports, Evil Geniuses, Natus Vincere |
| Player | object | 0.0% | Jamppi, nAts, soulcas, Redgar, Sayf |
| Enemy Team | object | 0.0% | Natus Vincere, LOUD, T1, FunPlus Phoenix, DRX |
| Enemy | object | 0.0% | ANGE1, SUYGETSU, Zyppan, cNed, Shao |
| Player Kills | float64 | 40.8% | 9.0, 6.0, 8.0, 7.0, 11.0 |
| Enemy Kills | float64 | 40.8% | 12.0, 10.0, 7.0, 5.0, 4.0 |
| Difference | float64 | 41.7% | -3.0, -4.0, 1.0, 2.0, 4.0 |
| Kill Type | object | 0.0% | All Kills, First Kills, Op Kills |

### `vct_2023\matches\kills_stats.csv`

- Rows: 10,868 | Columns: 20


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2023, Champions Tour 2023: Americas Last Ch..., Champions Tour 2023: EMEA Last Chance..., Champions Tour 2023: Pacific Last Cha..., Champions Tour 2023: Champions China ... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, Preliminary Stage, Regular Season |
| Match Type | object | 0.0% | Opening (D), Opening (B), Winner's (D), Opening (C), Winner's (B) |
| Match Name | object | 0.0% | Team Liquid vs Natus Vincere, DRX vs LOUD, FUT Esports vs T1, Evil Geniuses vs FunPlus Phoenix, Natus Vincere vs DRX |
| Map | object | 0.0% | All Maps, Fracture, Bind, Lotus, Split |
| Team | object | 0.0% | Team Liquid, Natus Vincere, DRX, LOUD, FUT Esports |
| Player | object | 0.0% | soulcas, Sayf, nAts, Redgar, Jamppi |
| Agents | object | 0.0% | astra, skye, breach, raze, viper, astra, sova, chamber, neon |
| 2k | float64 | 5.7% | 4.0, 8.0, 13.0, 9.0, 5.0 |
| 3k | float64 | 38.0% | 1.0, 3.0, 2.0, 4.0, 5.0 |
| 4k | float64 | 80.1% | 1.0, 2.0, 4.0, 3.0 |
| 5k | float64 | 97.1% | 1.0, 2.0 |
| 1v1 | float64 | 74.9% | 1.0, 2.0, 4.0, 3.0, 5.0 |
| 1v2 | float64 | 85.5% | 1.0, 3.0, 2.0, 4.0 |
| 1v3 | float64 | 96.2% | 1.0, 2.0 |
| 1v4 | float64 | 99.4% | 1.0 |
| 1v5 | float64 | 99.9% | 1.0 |
| Econ | int64 | 0.0% | 30, 48, 58, 38, 43 |
| Spike Plants | int64 | 0.0% | 2, 4, 5, 3, 8 |
| Spike Defuses | int64 | 0.0% | 0, 1, 2, 3, 4 |

### `vct_2023\matches\maps_played.csv`

- Rows: 830 | Columns: 5


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2023, Champions Tour 2023: Americas Last Ch..., Champions Tour 2023: EMEA Last Chance..., Champions Tour 2023: Pacific Last Cha..., Champions Tour 2023: Champions China ... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, Preliminary Stage, Regular Season |
| Match Type | object | 0.0% | Opening (D), Opening (B), Winner's (D), Opening (C), Winner's (B) |
| Match Name | object | 0.0% | Team Liquid vs Natus Vincere, DRX vs LOUD, FUT Esports vs T1, Evil Geniuses vs FunPlus Phoenix, Natus Vincere vs DRX |
| Map | object | 0.0% | Fracture, Bind, Lotus, Split, Ascent |

### `vct_2023\matches\maps_scores.csv`

- Rows: 830 | Columns: 16


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2023, Champions Tour 2023: Americas Last Ch..., Champions Tour 2023: EMEA Last Chance..., Champions Tour 2023: Pacific Last Cha..., Champions Tour 2023: Champions China ... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, Preliminary Stage, Regular Season |
| Match Type | object | 0.0% | Opening (D), Opening (B), Winner's (D), Opening (C), Winner's (B) |
| Match Name | object | 0.0% | Team Liquid vs Natus Vincere, DRX vs LOUD, FUT Esports vs T1, Evil Geniuses vs FunPlus Phoenix, Natus Vincere vs DRX |
| Map | object | 0.0% | Fracture, Bind, Lotus, Split, Ascent |
| Team A | object | 0.0% | Team Liquid, DRX, FUT Esports, Evil Geniuses, Natus Vincere |
| Team A Score | int64 | 0.0% | 11, 15, 13, 12, 8 |
| Team A Attacker Score | int64 | 0.0% | 6, 7, 8, 9, 4 |
| Team A Defender Score | int64 | 0.0% | 5, 4, 6, 7, 3 |
| Team A Overtime Score | float64 | 87.6% | 3.0, 1.0, 0.0, 4.0, 2.0 |
| Team B | object | 0.0% | Natus Vincere, LOUD, T1, FunPlus Phoenix, DRX |
| Team B Score | int64 | 0.0% | 13, 17, 15, 6, 8 |
| Team B Attacker Score | int64 | 0.0% | 7, 2, 4, 1, 5 |
| Team B Defender Score | int64 | 0.0% | 6, 5, 4, 3, 8 |
| Team B Overtime Score | float64 | 87.6% | 5.0, 3.0, 2.0, 1.0, 0.0 |
| Duration | object | 7.1% | 1:18:55, 1:22:57, 1:17:19, 47:47, 52:46 |

### `vct_2023\matches\overview.csv`

- Rows: 34,944 | Columns: 21


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2023, Champions Tour 2023: Americas Last Ch..., Champions Tour 2023: EMEA Last Chance..., Champions Tour 2023: Pacific Last Cha..., Champions Tour 2023: Champions China ... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, Preliminary Stage, Regular Season |
| Match Type | object | 0.0% | Opening (D), Opening (B), Winner's (D), Opening (C), Winner's (B) |
| Match Name | object | 0.0% | Team Liquid vs Natus Vincere, DRX vs LOUD, FUT Esports vs T1, Evil Geniuses vs FunPlus Phoenix, Natus Vincere vs DRX |
| Map | object | 0.0% | Fracture, All Maps, Bind, Lotus, Split |
| Player | object | 0.0% | nAts, Sayf, soulcas, Jamppi, Redgar |
| Team | object | 0.0% | Team Liquid, Natus Vincere, DRX, LOUD, FUT Esports |
| Agents | object | 0.0% | viper, breach, astra, neon, sova |
| Rating | float64 | 6.7% | 1.2, 1.4, 1.0, 0.96, 0.46 |
| Average Combat Score | float64 | 4.8% | 242.0, 268.0, 217.0, 170.0, 81.0 |
| Kills | float64 | 4.5% | 20.0, 12.0, 8.0, 14.0, 2.0 |
| Deaths | float64 | 4.5% | 15.0, 7.0, 8.0, 16.0, 10.0 |
| Assists | float64 | 4.5% | 3.0, 1.0, 2.0, 10.0, 6.0 |
| Kills - Deaths (KD) | float64 | 4.5% | 5.0, 0.0, -2.0, -8.0, 6.0 |
| Kill, Assist, Trade, Survive % | object | 6.7% | 67%, 75%, 58%, 71%, 83% |
| Average Damage Per Round | float64 | 6.7% | 144.0, 162.0, 125.0, 112.0, 50.0 |
| Headshot % | object | 6.8% | 33%, 46%, 21%, 23%, 20% |
| First Kills | float64 | 6.6% | 3.0, 1.0, 2.0, 0.0, 5.0 |
| First Deaths | float64 | 6.7% | 3.0, 1.0, 2.0, 0.0, 5.0 |
| Kills - Deaths (FKD) | float64 | 6.7% | 0.0, -1.0, -2.0, 1.0, 3.0 |
| Side | object | 0.0% | both, attack, defend |

### `vct_2023\matches\rounds_kills.csv`

- Rows: 70,078 | Columns: 13


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2023, Champions Tour 2023: Americas Last Ch..., Champions Tour 2023: EMEA Last Chance..., Champions Tour 2023: Pacific Last Cha..., Champions Tour 2023: Champions China ... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, Preliminary Stage, Regular Season |
| Match Type | object | 0.0% | Opening (D), Opening (B), Winner's (D), Opening (C), Winner's (B) |
| Match Name | object | 0.0% | Team Liquid vs Natus Vincere, DRX vs LOUD, FUT Esports vs T1, Evil Geniuses vs FunPlus Phoenix, Natus Vincere vs DRX |
| Map | object | 0.0% | Fracture, Bind, Lotus, Split, Ascent |
| Round Number | int64 | 0.0% | 1, 17, 18, 14, 6 |
| Eliminator Team | object | 0.0% | Team Liquid, Natus Vincere, DRX, LOUD, FUT Esports |
| Eliminator | object | 0.0% | soulcas, Sayf, nAts, Redgar, Jamppi |
| Eliminator Agent | object | 0.0% | astra, breach, viper, sova, neon |
| Eliminated Team | object | 0.0% | Natus Vincere, Team Liquid, LOUD, DRX, T1 |
| Eliminated | object | 0.0% | cNed, Shao, ANGE1, Zyppan, soulcas |
| Eliminated Agent | object | 0.0% | killjoy, fade, omen, raze, astra |
| Kill Type | object | 0.0% | 2k, 3k, 1v1, 4k, 5k |

### `vct_2023\matches\scores.csv`

- Rows: 331 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2023, Champions Tour 2023: Americas Last Ch..., Champions Tour 2023: EMEA Last Chance..., Champions Tour 2023: Pacific Last Cha..., Champions Tour 2023: Champions China ... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, Preliminary Stage, Regular Season |
| Match Type | object | 0.0% | Opening (D), Opening (B), Winner's (D), Opening (C), Winner's (B) |
| Match Name | object | 0.0% | Team Liquid vs Natus Vincere, DRX vs LOUD, FUT Esports vs T1, Evil Geniuses vs FunPlus Phoenix, Natus Vincere vs DRX |
| Team A | object | 0.0% | Team Liquid, DRX, FUT Esports, Evil Geniuses, Natus Vincere |
| Team B | object | 0.0% | Natus Vincere, LOUD, T1, FunPlus Phoenix, DRX |
| Team A Score | int64 | 0.0% | 0, 2, 1, 3 |
| Team B Score | int64 | 0.0% | 2, 1, 0, 3 |
| Match Result | object | 0.0% | Natus Vincere won, DRX won, FUT Esports won, Evil Geniuses won, Bilibili Gaming won |

### `vct_2023\matches\team_mapping.csv`

- Rows: 51 | Columns: 2


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Abbreviated | object | 0.0% | TL, NAVI, DRX, LOUD, FUT |
| Full Name | object | 0.0% | Team Liquid, Natus Vincere, DRX, LOUD, FUT Esports |

### `vct_2023\matches\win_loss_methods_count.csv`

- Rows: 1,660 | Columns: 14


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2023, Champions Tour 2023: Americas Last Ch..., Champions Tour 2023: EMEA Last Chance..., Champions Tour 2023: Pacific Last Cha..., Champions Tour 2023: Champions China ... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, Preliminary Stage, Regular Season |
| Match Type | object | 0.0% | Opening (D), Opening (B), Winner's (D), Opening (C), Winner's (B) |
| Match Name | object | 0.0% | Team Liquid vs Natus Vincere, DRX vs LOUD, FUT Esports vs T1, Evil Geniuses vs FunPlus Phoenix, Natus Vincere vs DRX |
| Map | object | 0.0% | Fracture, Bind, Lotus, Split, Ascent |
| Team | object | 0.0% | Team Liquid, Natus Vincere, DRX, LOUD, FUT Esports |
| Elimination | int64 | 0.0% | 8, 6, 11, 5, 2 |
| Detonated | int64 | 0.0% | 2, 5, 1, 4, 0 |
| Defused | int64 | 0.0% | 1, 2, 4, 3, 6 |
| Time Expiry (No Plant) | int64 | 0.0% | 0, 1, 2, 4, 3 |
| Eliminated | int64 | 0.0% | 6, 8, 11, 5, 2 |
| Defused Failed | int64 | 0.0% | 5, 2, 1, 4, 0 |
| Detonation Denied | int64 | 0.0% | 1, 4, 2, 3, 6 |
| Time Expiry (Failed to Plant) | int64 | 0.0% | 1, 0, 2, 4, 3 |

### `vct_2023\matches\win_loss_methods_round_number.csv`

- Rows: 35,514 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2023, Champions Tour 2023: Americas Last Ch..., Champions Tour 2023: EMEA Last Chance..., Champions Tour 2023: Pacific Last Cha..., Champions Tour 2023: Champions China ... |
| Stage | object | 0.0% | Group Stage, Playoffs, Main Event, Preliminary Stage, Regular Season |
| Match Type | object | 0.0% | Opening (D), Opening (B), Winner's (D), Opening (C), Winner's (B) |
| Match Name | object | 0.0% | Team Liquid vs Natus Vincere, DRX vs LOUD, FUT Esports vs T1, Evil Geniuses vs FunPlus Phoenix, Natus Vincere vs DRX |
| Map | object | 0.0% | Fracture, Bind, Lotus, Split, Ascent |
| Round Number | int64 | 0.0% | 1, 2, 3, 4, 5 |
| Team | object | 0.0% | Team Liquid, Natus Vincere, LOUD, DRX, FUT Esports |
| Method | object | 0.0% | Elimination, Eliminated, Detonated, Failed Defused, Defused |
| Outcome | object | 0.0% | Win, Loss |

### `vct_2023\players_stats\players_stats.csv`

- Rows: 11,249 | Columns: 25


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Champions Tour 2023: EMEA Last Chance..., Champions Tour 2023: Americas Last Ch..., Champions Tour 2023: Pacific Last Cha..., Valorant Champions 2023, Champions Tour 2023: Masters Tokyo |
| Stage | object | 0.0% | Playoffs, All Stages, Main Event, Group Stage, Preliminary Stage |
| Match Type | object | 0.0% | Knockout Round, Upper Semifinals, Upper Final, Grand Final, Lower Round 1 |
| Player | object | 0.0% | Wolfen, koldamenta, sheydos, starxo, trexx |
| Teams | object | 0.0% | KOI, Team Heretics, Karmine Corp, BBL Esports, Giants Gaming |
| Agents | object | 0.0% | cypher, jett, cypher, jett, astra, brimstone |
| Rounds Played | int64 | 0.0% | 21, 42, 63, 23, 19 |
| Rating | float64 | 5.8% | 1.03, 1.25, 1.18, 0.82, 1.07 |
| Average Combat Score | float64 | 0.1% | 209.0, 300.0, 269.0, 64.0, 196.0 |
| Kills:Deaths | float64 | 0.0% | 1.0, 1.36, 1.24, 0.45, 0.83 |
| Kill, Assist, Trade, Survive % | object | 5.8% | 86%, 71%, 76%, 78%, 95% |
| Average Damage Per Round | float64 | 5.8% | 140.0, 180.0, 167.0, 47.0, 112.0 |
| Kills Per Round | float64 | 0.0% | 0.76, 1.07, 0.97, 0.22, 0.67 |
| Assists Per Round | float64 | 0.0% | 0.33, 0.14, 0.21, 0.39, 0.62 |
| First Kills Per Round | float64 | 5.6% | 0.14, 0.29, 0.24, 0.0, 0.1 |
| First Deaths Per Round | float64 | 5.8% | 0.1, 0.29, 0.22, 0.0, 0.05 |
| Headshot % | object | 5.9% | 21%, 26%, 25%, 30%, 15% |
| Clutch Success % | object | 11.4% | 0%, 100%, 25%, 50%, 33% |
| Clutches (won/played) | object | 11.4% | 0/2, 0/1, 0/3, 1/1, 1/4 |
| Maximum Kills in a Single Map | int64 | 0.0% | 16, 25, 5, 14, 11 |
| Kills | int64 | 0.0% | 16, 45, 61, 5, 14 |
| Deaths | int64 | 0.0% | 16, 33, 49, 11, 14 |
| Assists | int64 | 0.0% | 7, 6, 13, 9, 35 |
| First Kills | int64 | 0.0% | 3, 12, 15, 0, 2 |
| First Deaths | int64 | 0.0% | 2, 12, 14, 0, 1 |

## vct_2024


### `vct_2024\agents\agents_pick_rates.csv`

- Rows: 24,840 | Columns: 6


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2024, Champions Tour 2024: China Stage 2, Champions Tour 2024: EMEA Stage 2, Champions Tour 2024: Americas Stage 2, Champions Tour 2024: Pacific Stage 2 |
| Stage | object | 0.0% | Playoffs, Group Stage, All Stages, Regular Season, Swiss Stage |
| Match Type | object | 0.0% | Upper Quarterfinals, Upper Semifinals, Upper Final, Grand Final, Lower Round 1 |
| Map | object | 0.0% | All Maps, Sunset, Abyss, Bind, Haven |
| Agent | object | 0.0% | sova, cypher, omen, viper, killjoy |
| Pick Rate | object | 0.0% | 69%, 56%, 44%, 38%, 31% |

### `vct_2024\agents\maps_stats.csv`

- Rows: 1,035 | Columns: 7


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2024, Champions Tour 2024: China Stage 2, Champions Tour 2024: EMEA Stage 2, Champions Tour 2024: Americas Stage 2, Champions Tour 2024: Pacific Stage 2 |
| Stage | object | 0.0% | Playoffs, Group Stage, All Stages, Regular Season, Swiss Stage |
| Match Type | object | 0.0% | Upper Quarterfinals, Upper Semifinals, Upper Final, Grand Final, Lower Round 1 |
| Map | object | 0.0% | All Maps, Sunset, Abyss, Bind, Haven |
| Total Maps Played | int64 | 0.0% | 8, 2, 1, 5, 3 |
| Attacker Side Win Percentage | object | 0.0% | 53%, 36%, 64%, 75%, 38% |
| Defender Side Win Percentage | object | 0.0% | 47%, 64%, 36%, 25%, 62% |

### `vct_2024\agents\teams_picked_agents.csv`

- Rows: 15,647 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2024, Champions Tour 2024: China Stage 2, Champions Tour 2024: EMEA Stage 2, Champions Tour 2024: Americas Stage 2, Champions Tour 2024: Pacific Stage 2 |
| Stage | object | 0.0% | Playoffs, Group Stage, All Stages, Regular Season, Swiss Stage |
| Match Type | object | 0.0% | Upper Quarterfinals, Upper Semifinals, Upper Final, Grand Final, Lower Round 1 |
| Map | object | 0.0% | Sunset, Haven, Bind, Icebox, Abyss |
| Team | object | 0.0% | DRX, Sentinels, Trace Esports, EDward Gaming, G2 Esports |
| Agent | object | 0.0% | sova, cypher, omen, breach, neon |
| Total Wins By Map | int64 | 0.0% | 0, 1, 2, 3, 4 |
| Total Loss By Map | int64 | 0.0% | 1, 0, 2, 3, 4 |
| Total Maps Played | int64 | 0.0% | 1, 3, 4, 2, 6 |

### `vct_2024\ids\players_ids.csv`

- Rows: 260 | Columns: 2


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Player | object | 0.0% | t3xture, Meteor, Lakia, Karon, Munchkin |
| Player ID | int64 | 0.0% | 9196, 13039, 773, 34974, 2489 |

### `vct_2024\ids\teams_ids.csv`

- Rows: 44 | Columns: 2


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Team | object | 0.0% | Gen.G, Sentinels, FunPlus Phoenix, Team Heretics, DRX |
| Team ID | int64 | 0.0% | 17, 2, 11328, 1001, 8185 |

### `vct_2024\ids\tournaments_stages_match_types_ids.csv`

- Rows: 197 | Columns: 6


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2024, Champions Tour 2024: China Stage 2, Champions Tour 2024: EMEA Stage 2, Champions Tour 2024: Americas Stage 2, Champions Tour 2024: Pacific Stage 2 |
| Tournament ID | int64 | 0.0% | 2097, 2096, 2094, 2095, 2005 |
| Stage | object | 0.0% | Playoffs, Group Stage, All Stages, Regular Season, Swiss Stage |
| Stage ID | float64 | 7.6% | 4131.0, 4035.0, 4034.0, 4033.0, 4030.0 |
| Match Type | object | 0.0% | Upper Quarterfinals, Upper Semifinals, Upper Final, Grand Final, Lower Round 1 |
| Match Type ID | float64 | 7.6% | 26235.0, 26236.0, 26237.0, 26238.0, 26239.0 |

### `vct_2024\ids\tournaments_stages_matches_games_ids.csv`

- Rows: 1,104 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2024, Champions Tour 2024: Americas Stage 2, Champions Tour 2024: China Stage 2, Champions Tour 2024: Pacific Stage 2, Champions Tour 2024: EMEA Stage 2 |
| Tournament ID | int64 | 0.0% | 2097, 2095, 2096, 2005, 2094 |
| Stage | object | 0.0% | Group Stage, Playoffs, Regular Season, Swiss Stage, Play-Ins |
| Stage ID | int64 | 0.0% | 4035, 4131, 4031, 4032, 4033 |
| Match Type | object | 0.0% | Opening (B), Opening (A), Opening (C), Opening (D), Winner's (B) |
| Match Name | object | 0.0% | Gen.G vs Sentinels, FunPlus Phoenix vs Team Heretics, DRX vs KRÜ Esports, FNATIC vs Bilibili Gaming, LEVIATÁN vs Talon Esports |
| Match ID | int64 | 0.0% | 378662, 378663, 378657, 378656, 378667 |
| Map | object | 0.0% | Haven, Ascent, Abyss, Bind, Lotus |
| Game ID | int64 | 0.0% | 180369, 180370, 180372, 180373, 180374 |

### `vct_2024\matches\draft_phase.csv`

- Rows: 2,604 | Columns: 7


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2024, Champions Tour 2024: Americas Stage 2, Champions Tour 2024: China Stage 2, Champions Tour 2024: Pacific Stage 2, Champions Tour 2024: EMEA Stage 2 |
| Stage | object | 0.0% | Group Stage, Playoffs, Regular Season, Swiss Stage, Play-Ins |
| Match Type | object | 0.0% | Opening (B), Opening (A), Opening (C), Opening (D), Winner's (B) |
| Match Name | object | 0.0% | Gen.G vs Sentinels, FunPlus Phoenix vs Team Heretics, DRX vs KRÜ Esports, FNATIC vs Bilibili Gaming, LEVIATÁN vs Talon Esports |
| Team | object | 0.0% | Sentinels, Gen.G, FunPlus Phoenix, Team Heretics, KRÜ Esports |
| Action | object | 0.0% | ban, pick |
| Map | object | 0.0% | Icebox, Sunset, Haven, Ascent, Bind |

### `vct_2024\matches\eco_rounds.csv`

- Rows: 34,514 | Columns: 11


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2024, Champions Tour 2024: Americas Stage 2, Champions Tour 2024: Pacific Stage 2, Champions Tour 2024: EMEA Stage 2, Champions Tour 2024: Americas Stage 1 |
| Stage | object | 0.0% | Group Stage, Playoffs, Regular Season, Swiss Stage, Play-Ins |
| Match Type | object | 0.0% | Opening (B), Opening (A), Opening (C), Opening (D), Winner's (B) |
| Match Name | object | 0.0% | Gen.G vs Sentinels, FunPlus Phoenix vs Team Heretics, DRX vs KRÜ Esports, FNATIC vs Bilibili Gaming, LEVIATÁN vs Talon Esports |
| Map | object | 0.0% | Haven, Ascent, Abyss, Bind, Lotus |
| Round Number | int64 | 0.0% | 1, 2, 3, 4, 5 |
| Team | object | 0.0% | Gen.G, Sentinels, FunPlus Phoenix, Team Heretics, DRX |
| Loadout Value | object | 0.0% | 3.9k, 3.8k, 14.5k, 3.4k, 15.3k |
| Remaining Credits | object | 0.0% | 0.3k, 0.2k, 2.4k, 9.0k, 11.7k |
| Type | object | 0.0% | Eco: 0-5k, Semi-buy: 10-20k, Full buy: 20k+, Semi-eco: 5-10k |
| Outcome | object | 0.0% | Win, Loss |

### `vct_2024\matches\eco_stats.csv`

- Rows: 11,350 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2024, Champions Tour 2024: Americas Stage 2, Champions Tour 2024: Pacific Stage 2, Champions Tour 2024: EMEA Stage 2, Champions Tour 2024: Americas Stage 1 |
| Stage | object | 0.0% | Group Stage, Playoffs, Regular Season, Swiss Stage, Play-Ins |
| Match Type | object | 0.0% | Opening (B), Opening (A), Opening (C), Opening (D), Winner's (B) |
| Match Name | object | 0.0% | Gen.G vs Sentinels, FunPlus Phoenix vs Team Heretics, DRX vs KRÜ Esports, FNATIC vs Bilibili Gaming, LEVIATÁN vs Talon Esports |
| Map | object | 0.0% | Haven, Ascent, All Maps, Abyss, Bind |
| Team | object | 0.0% | Gen.G, Sentinels, FunPlus Phoenix, Team Heretics, DRX |
| Type | object | 0.0% | Pistol Won, Eco (won), $ (won), $$ (won), $$$ (won) |
| Initiated | float64 | 20.0% | 2.0, 1.0, 6.0, 12.0, 4.0 |
| Won | int64 | 0.0% | 2, 0, 4, 7, 6 |

### `vct_2024\matches\kills.csv`

- Rows: 85,125 | Columns: 13


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2024, Champions Tour 2024: Americas Stage 2, Champions Tour 2024: Pacific Stage 2, Champions Tour 2024: EMEA Stage 2, Champions Tour 2024: Americas Stage 1 |
| Stage | object | 0.0% | Group Stage, Playoffs, Regular Season, Swiss Stage, Play-Ins |
| Match Type | object | 0.0% | Opening (B), Opening (A), Opening (C), Opening (D), Winner's (B) |
| Match Name | object | 0.0% | Gen.G vs Sentinels, FunPlus Phoenix vs Team Heretics, DRX vs KRÜ Esports, FNATIC vs Bilibili Gaming, LEVIATÁN vs Talon Esports |
| Map | object | 0.0% | All Maps, Haven, Ascent, Abyss, Bind |
| Player Team | object | 0.0% | Gen.G, FunPlus Phoenix, DRX, FNATIC, LEVIATÁN |
| Player | object | 0.0% | Lakia, Munchkin, t3xture, Meteor, Karon |
| Enemy Team | object | 0.0% | Sentinels, Team Heretics, KRÜ Esports, Bilibili Gaming, Talon Esports |
| Enemy | object | 0.0% | zekken, johnqt, Zellsis, TenZ, Sacy |
| Player Kills | float64 | 42.0% | 2.0, 5.0, 4.0, 7.0, 6.0 |
| Enemy Kills | float64 | 42.0% | 2.0, 7.0, 4.0, 10.0, 5.0 |
| Difference | float64 | 42.1% | 0.0, -2.0, 3.0, 1.0, -6.0 |
| Kill Type | object | 0.0% | All Kills, First Kills, Op Kills |

### `vct_2024\matches\kills_stats.csv`

- Rows: 11,354 | Columns: 20


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2024, Champions Tour 2024: Americas Stage 2, Champions Tour 2024: Pacific Stage 2, Champions Tour 2024: EMEA Stage 2, Champions Tour 2024: Americas Stage 1 |
| Stage | object | 0.0% | Group Stage, Playoffs, Regular Season, Swiss Stage, Play-Ins |
| Match Type | object | 0.0% | Opening (B), Opening (A), Opening (C), Opening (D), Winner's (B) |
| Match Name | object | 0.0% | Gen.G vs Sentinels, FunPlus Phoenix vs Team Heretics, DRX vs KRÜ Esports, FNATIC vs Bilibili Gaming, LEVIATÁN vs Talon Esports |
| Map | object | 0.0% | All Maps, Haven, Ascent, Abyss, Bind |
| Team | object | 0.0% | Gen.G, Sentinels, FunPlus Phoenix, Team Heretics, DRX |
| Player | object | 0.0% | Lakia, Munchkin, t3xture, Meteor, Karon |
| Agents | object | 0.0% | skye, sova, kayo, viper, jett, killjoy, omen |
| 2k | float64 | 5.6% | 6.0, 3.0, 9.0, 8.0, 2.0 |
| 3k | float64 | 37.5% | 3.0, 1.0, 2.0, 4.0, 5.0 |
| 4k | float64 | 79.8% | 1.0, 2.0, 4.0, 3.0 |
| 5k | float64 | 97.3% | 1.0, 2.0, 3.0 |
| 1v1 | float64 | 76.3% | 1.0, 2.0, 4.0, 3.0, 5.0 |
| 1v2 | float64 | 86.5% | 1.0, 2.0, 3.0 |
| 1v3 | float64 | 95.8% | 1.0, 2.0, 3.0 |
| 1v4 | float64 | 99.3% | 1.0 |
| 1v5 | float64 | 99.9% | 1.0 |
| Econ | int64 | 0.0% | 40, 49, 73, 68, 54 |
| Spike Plants | int64 | 0.0% | 6, 0, 1, 3, 7 |
| Spike Defuses | int64 | 0.0% | 0, 3, 1, 2, 4 |

### `vct_2024\matches\maps_played.csv`

- Rows: 1,104 | Columns: 5


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2024, Champions Tour 2024: Americas Stage 2, Champions Tour 2024: China Stage 2, Champions Tour 2024: Pacific Stage 2, Champions Tour 2024: EMEA Stage 2 |
| Stage | object | 0.0% | Group Stage, Playoffs, Regular Season, Swiss Stage, Play-Ins |
| Match Type | object | 0.0% | Opening (B), Opening (A), Opening (C), Opening (D), Winner's (B) |
| Match Name | object | 0.0% | Gen.G vs Sentinels, FunPlus Phoenix vs Team Heretics, DRX vs KRÜ Esports, FNATIC vs Bilibili Gaming, LEVIATÁN vs Talon Esports |
| Map | object | 0.0% | Haven, Ascent, Abyss, Bind, Lotus |

### `vct_2024\matches\maps_scores.csv`

- Rows: 1,104 | Columns: 16


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2024, Champions Tour 2024: Americas Stage 2, Champions Tour 2024: China Stage 2, Champions Tour 2024: Pacific Stage 2, Champions Tour 2024: EMEA Stage 2 |
| Stage | object | 0.0% | Group Stage, Playoffs, Regular Season, Swiss Stage, Play-Ins |
| Match Type | object | 0.0% | Opening (B), Opening (A), Opening (C), Opening (D), Winner's (B) |
| Match Name | object | 0.0% | Gen.G vs Sentinels, FunPlus Phoenix vs Team Heretics, DRX vs KRÜ Esports, FNATIC vs Bilibili Gaming, LEVIATÁN vs Talon Esports |
| Map | object | 0.0% | Haven, Ascent, Abyss, Bind, Lotus |
| Team A | object | 0.0% | Gen.G, FunPlus Phoenix, DRX, FNATIC, LEVIATÁN |
| Team A Score | int64 | 0.0% | 13, 12, 2, 7, 11 |
| Team A Attacker Score | int64 | 0.0% | 7, 8, 6, 2, 9 |
| Team A Defender Score | int64 | 0.0% | 6, 5, 4, 0, 3 |
| Team A Overtime Score | float64 | 89.9% | 0.0, 1.0, 2.0, 3.0, 4.0 |
| Team B | object | 0.0% | Sentinels, Team Heretics, KRÜ Esports, Bilibili Gaming, Talon Esports |
| Team B Score | int64 | 0.0% | 8, 7, 14, 9, 15 |
| Team B Attacker Score | int64 | 0.0% | 3, 8, 5, 6, 2 |
| Team B Defender Score | int64 | 0.0% | 5, 4, 6, 10, 3 |
| Team B Overtime Score | float64 | 89.9% | 2.0, 3.0, 0.0, 4.0, 1.0 |
| Duration | object | 26.2% | 1:02:40, 46:45, 1:10:12, 53:01, 1:07:12 |

### `vct_2024\matches\overview.csv`

- Rows: 46,152 | Columns: 21


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2024, Champions Tour 2024: Americas Stage 2, Champions Tour 2024: China Stage 2, Champions Tour 2024: Pacific Stage 2, Champions Tour 2024: EMEA Stage 2 |
| Stage | object | 0.0% | Group Stage, Playoffs, Regular Season, Swiss Stage, Play-Ins |
| Match Type | object | 0.0% | Opening (B), Opening (A), Opening (C), Opening (D), Winner's (B) |
| Match Name | object | 0.0% | Gen.G vs Sentinels, FunPlus Phoenix vs Team Heretics, DRX vs KRÜ Esports, FNATIC vs Bilibili Gaming, LEVIATÁN vs Talon Esports |
| Map | object | 0.0% | Haven, All Maps, Ascent, Abyss, Bind |
| Player | object | 0.0% | t3xture, Meteor, Lakia, Karon, Munchkin |
| Team | object | 0.0% | Gen.G, Sentinels, FunPlus Phoenix, Team Heretics, DRX |
| Agents | object | 0.0% | jett, killjoy, skye, omen, viper |
| Rating | float64 | 26.2% | 1.6, 1.71, 1.52, 1.23, 1.16 |
| Average Combat Score | float64 | 17.5% | 305.0, 364.0, 261.0, 221.0, 229.0 |
| Kills | float64 | 17.5% | 24.0, 12.0, 17.0, 8.0, 9.0 |
| Deaths | float64 | 17.5% | 12.0, 5.0, 7.0, 10.0, 4.0 |
| Assists | float64 | 17.5% | 4.0, 2.0, 1.0, 3.0, 12.0 |
| Kills - Deaths (KD) | float64 | 17.5% | 12.0, 7.0, 5.0, 4.0, 3.0 |
| Kill, Assist, Trade, Survive % | object | 26.2% | 81%, 89%, 75%, 76%, 78% |
| Average Damage Per Round | float64 | 21.8% | 188.0, 216.0, 168.0, 140.0, 127.0 |
| Headshot % | object | 21.8% | 31%, 37%, 24%, 26%, 35% |
| First Kills | float64 | 21.8% | 3.0, 2.0, 1.0, 0.0, 7.0 |
| First Deaths | float64 | 21.8% | 4.0, 2.0, 1.0, 3.0, 0.0 |
| Kills - Deaths (FKD) | float64 | 21.8% | -1.0, 0.0, -3.0, 1.0, 2.0 |
| Side | object | 0.0% | both, attack, defend |

### `vct_2024\matches\rounds_kills.csv`

- Rows: 72,660 | Columns: 13


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2024, Champions Tour 2024: Americas Stage 2, Champions Tour 2024: Pacific Stage 2, Champions Tour 2024: EMEA Stage 2, Champions Tour 2024: Americas Stage 1 |
| Stage | object | 0.0% | Group Stage, Playoffs, Regular Season, Swiss Stage, Play-Ins |
| Match Type | object | 0.0% | Opening (B), Opening (A), Opening (C), Opening (D), Winner's (B) |
| Match Name | object | 0.0% | Gen.G vs Sentinels, FunPlus Phoenix vs Team Heretics, DRX vs KRÜ Esports, FNATIC vs Bilibili Gaming, LEVIATÁN vs Talon Esports |
| Map | object | 0.0% | Haven, Ascent, Abyss, Bind, Lotus |
| Round Number | int64 | 0.0% | 9, 11, 14, 18, 16 |
| Eliminator Team | object | 0.0% | Gen.G, Sentinels, FunPlus Phoenix, Team Heretics, DRX |
| Eliminator | object | 0.0% | Lakia, Munchkin, t3xture, Meteor, Karon |
| Eliminator Agent | object | 0.0% | skye, viper, jett, killjoy, omen |
| Eliminated Team | object | 0.0% | Sentinels, Gen.G, Team Heretics, FunPlus Phoenix, KRÜ Esports |
| Eliminated | object | 0.0% | TenZ, Zellsis, johnqt, Sacy, zekken |
| Eliminated Agent | object | 0.0% | omen, breach, cypher, sova, jett |
| Kill Type | object | 0.0% | 2k, 3k, 4k, 1v2, 1v1 |

### `vct_2024\matches\scores.csv`

- Rows: 434 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2024, Champions Tour 2024: Americas Stage 2, Champions Tour 2024: China Stage 2, Champions Tour 2024: Pacific Stage 2, Champions Tour 2024: EMEA Stage 2 |
| Stage | object | 0.0% | Group Stage, Playoffs, Regular Season, Swiss Stage, Play-Ins |
| Match Type | object | 0.0% | Opening (B), Opening (A), Opening (C), Opening (D), Winner's (B) |
| Match Name | object | 0.0% | Gen.G vs Sentinels, FunPlus Phoenix vs Team Heretics, DRX vs KRÜ Esports, FNATIC vs Bilibili Gaming, LEVIATÁN vs Talon Esports |
| Team A | object | 0.0% | Gen.G, FunPlus Phoenix, DRX, FNATIC, LEVIATÁN |
| Team B | object | 0.0% | Sentinels, Team Heretics, KRÜ Esports, Bilibili Gaming, Talon Esports |
| Team A Score | int64 | 0.0% | 2, 1, 0, 3 |
| Team B Score | int64 | 0.0% | 0, 2, 1, 3 |
| Match Result | object | 0.0% | Gen.G won, Team Heretics won, DRX won, FNATIC won, LEVIATÁN won |

### `vct_2024\matches\team_mapping.csv`

- Rows: 44 | Columns: 2


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Abbreviated | object | 0.0% | GEN, SEN, FPX, TH, DRX |
| Full Name | object | 0.0% | Gen.G, Sentinels, FunPlus Phoenix, Team Heretics, DRX |

### `vct_2024\matches\win_loss_methods_count.csv`

- Rows: 2,208 | Columns: 14


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2024, Champions Tour 2024: Americas Stage 2, Champions Tour 2024: China Stage 2, Champions Tour 2024: Pacific Stage 2, Champions Tour 2024: EMEA Stage 2 |
| Stage | object | 0.0% | Group Stage, Playoffs, Regular Season, Swiss Stage, Play-Ins |
| Match Type | object | 0.0% | Opening (B), Opening (A), Opening (C), Opening (D), Winner's (B) |
| Match Name | object | 0.0% | Gen.G vs Sentinels, FunPlus Phoenix vs Team Heretics, DRX vs KRÜ Esports, FNATIC vs Bilibili Gaming, LEVIATÁN vs Talon Esports |
| Map | object | 0.0% | Haven, Ascent, Abyss, Bind, Lotus |
| Team | object | 0.0% | Gen.G, Sentinels, FunPlus Phoenix, Team Heretics, DRX |
| Elimination | int64 | 0.0% | 7, 3, 9, 5, 10 |
| Detonated | int64 | 0.0% | 1, 2, 4, 0, 3 |
| Defused | int64 | 0.0% | 4, 3, 0, 2, 5 |
| Time Expiry (No Plant) | int64 | 0.0% | 1, 0, 2, 3, 4 |
| Eliminated | int64 | 0.0% | 3, 7, 5, 9, 10 |
| Defused Failed | int64 | 0.0% | 2, 1, 0, 4, 3 |
| Detonation Denied | int64 | 0.0% | 3, 4, 2, 0, 5 |
| Time Expiry (Failed to Plant) | int64 | 0.0% | 0, 1, 2, 3, 4 |

### `vct_2024\matches\win_loss_methods_round_number.csv`

- Rows: 46,754 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2024, Champions Tour 2024: Americas Stage 2, Champions Tour 2024: China Stage 2, Champions Tour 2024: Pacific Stage 2, Champions Tour 2024: EMEA Stage 2 |
| Stage | object | 0.0% | Group Stage, Playoffs, Regular Season, Swiss Stage, Play-Ins |
| Match Type | object | 0.0% | Opening (B), Opening (A), Opening (C), Opening (D), Winner's (B) |
| Match Name | object | 0.0% | Gen.G vs Sentinels, FunPlus Phoenix vs Team Heretics, DRX vs KRÜ Esports, FNATIC vs Bilibili Gaming, LEVIATÁN vs Talon Esports |
| Map | object | 0.0% | Haven, Ascent, Abyss, Bind, Lotus |
| Round Number | int64 | 0.0% | 1, 2, 3, 4, 5 |
| Team | object | 0.0% | Gen.G, Sentinels, Team Heretics, FunPlus Phoenix, KRÜ Esports |
| Method | object | 0.0% | Defused, Detonated Denied, Elimination, Eliminated, Detonated |
| Outcome | object | 0.0% | Win, Loss |

### `vct_2024\players_stats\players_stats.csv`

- Rows: 15,030 | Columns: 25


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2024, Champions Tour 2024: Americas Stage 2, Champions Tour 2024: EMEA Stage 2, Champions Tour 2024: China Stage 2, Champions Tour 2024: Pacific Stage 1 |
| Stage | object | 0.0% | Playoffs, Group Stage, All Stages, Regular Season, Swiss Stage |
| Match Type | object | 0.0% | Upper Quarterfinals, Upper Semifinals, Upper Final, Grand Final, Lower Round 1 |
| Player | object | 0.0% | Boo, benjyfishy, Wo0t, MiniBoo, RieNs |
| Teams | object | 0.0% | Team Heretics, G2 Esports, FNATIC, Sentinels, DRX |
| Agents | object | 0.0% | astra, fade, astra, fade, cypher, killjoy |
| Rounds Played | int64 | 0.0% | 26, 16, 42, 18, 30 |
| Rating | float64 | 26.5% | 0.75, 1.1, 0.88, 0.85, 1.36 |
| Average Combat Score | int64 | 0.0% | 138, 185, 162, 203, 169 |
| Kills:Deaths | float64 | 0.0% | 0.58, 1.38, 0.81, 0.86, 2.4 |
| Kill, Assist, Trade, Survive % | object | 26.5% | 73%, 81%, 76%, 65%, 71% |
| Average Damage Per Round | float64 | 13.2% | 92.0, 122.0, 104.0, 128.0, 120.0 |
| Kills Per Round | float64 | 0.0% | 0.42, 0.69, 0.52, 0.75, 0.71 |
| Assists Per Round | float64 | 0.0% | 0.54, 0.19, 0.4, 0.12, 0.13 |
| First Kills Per Round | float64 | 13.2% | 0.04, 0.13, 0.07, 0.08, 0.06 |
| First Deaths Per Round | float64 | 13.2% | 0.08, 0.0, 0.05, 0.15, 0.1 |
| Headshot % | object | 26.5% | 21%, 34%, 28%, 32%, 53% |
| Clutch Success % | object | 31.0% | 22%, 50%, 0%, 100%, 67% |
| Clutches (won/played) | object | 31.0% | 2/9, 1/2, 0/2, 0/1, 0/3 |
| Maximum Kills in a Single Map | int64 | 0.0% | 11, 18, 12, 10, 16 |
| Kills | int64 | 0.0% | 11, 22, 18, 12, 30 |
| Deaths | int64 | 0.0% | 19, 8, 27, 21, 5 |
| Assists | int64 | 0.0% | 14, 3, 17, 2, 5 |
| First Kills | int64 | 0.0% | 1, 2, 3, 0, 5 |
| First Deaths | int64 | 0.0% | 2, 0, 4, 7, 3 |

## vct_2025


### `vct_2025\agents\agents_pick_rates.csv`

- Rows: 30,294 | Columns: 6


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2025, VCT 2025: Pacific Stage 2, VCT 2025: China Stage 2, VCT 2025: EMEA Stage 2, VCT 2025: Americas Stage 2 |
| Stage | object | 0.0% | Playoffs, Group Stage, All Stages, Swiss Stage, Main Event |
| Match Type | object | 0.0% | Upper Quarterfinals, Upper Semifinals, Upper Final, Grand Final, Lower Round 1 |
| Map | object | 0.0% | All Maps, Lotus, Ascent, Corrode, Haven |
| Agent | object | 0.0% | omen, yoru, viper, sova, vyse |
| Pick Rate | object | 0.0% | 95%, 60%, 55%, 50%, 45% |

### `vct_2025\agents\maps_stats.csv`

- Rows: 1,122 | Columns: 7


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2025, VCT 2025: Pacific Stage 2, VCT 2025: China Stage 2, VCT 2025: EMEA Stage 2, VCT 2025: Americas Stage 2 |
| Stage | object | 0.0% | Playoffs, Group Stage, All Stages, Swiss Stage, Main Event |
| Match Type | object | 0.0% | Upper Quarterfinals, Upper Semifinals, Upper Final, Grand Final, Lower Round 1 |
| Map | object | 0.0% | All Maps, Lotus, Ascent, Corrode, Haven |
| Total Maps Played | int64 | 0.0% | 10, 3, 2, 1, 6 |
| Attacker Side Win Percentage | object | 0.0% | 62%, 56%, 67%, 58%, 84% |
| Defender Side Win Percentage | object | 0.0% | 38%, 44%, 33%, 42%, 16% |

### `vct_2025\agents\teams_picked_agents.csv`

- Rows: 18,396 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2025, VCT 2025: Pacific Stage 2, VCT 2025: China Stage 2, VCT 2025: EMEA Stage 2, VCT 2025: Americas Stage 2 |
| Stage | object | 0.0% | Playoffs, Group Stage, All Stages, Swiss Stage, Main Event |
| Match Type | object | 0.0% | Upper Quarterfinals, Upper Semifinals, Upper Final, Grand Final, Lower Round 1 |
| Map | object | 0.0% | Haven, Ascent, Lotus, Corrode, Sunset |
| Team | object | 0.0% | FNATIC, DRX, Mega Minors, GIANTX, Paper Rex |
| Agent | object | 0.0% | omen, yoru, viper, sova, killjoy |
| Total Wins By Map | int64 | 0.0% | 1, 0, 3, 2, 4 |
| Total Loss By Map | int64 | 0.0% | 0, 1, 2, 3, 4 |
| Total Maps Played | int64 | 0.0% | 1, 3, 4, 2, 5 |

### `vct_2025\ids\players_ids.csv`

- Rows: 349 | Columns: 2


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Player | object | 0.0% | something, Jinggg, f0rsakeN, d4v41, PatMen |
| Player ID | float64 | 0.6% | 17086.0, 7378.0, 9801.0, 9803.0, 13744.0 |

### `vct_2025\ids\teams_ids.csv`

- Rows: 58 | Columns: 2


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Team | object | 0.0% | Paper Rex, Xi Lai Gaming, GIANTX, Sentinels, NRG |
| Team ID | int64 | 0.0% | 624, 13581, 14419, 2, 1034 |

### `vct_2025\ids\tournaments_stages_match_types_ids.csv`

- Rows: 202 | Columns: 6


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2025, VCT 2025: Pacific Stage 2, VCT 2025: China Stage 2, VCT 2025: EMEA Stage 2, VCT 2025: Americas Stage 2 |
| Tournament ID | int64 | 0.0% | 2283, 2500, 2499, 2498, 2501 |
| Stage | object | 0.0% | Playoffs, Group Stage, All Stages, Swiss Stage, Main Event |
| Stage ID | float64 | 7.4% | 5080.0, 5079.0, 4862.0, 4858.0, 4863.0 |
| Match Type | object | 0.0% | Upper Quarterfinals, Upper Semifinals, Upper Final, Grand Final, Lower Round 1 |
| Match Type ID | float64 | 7.4% | 33667.0, 33668.0, 33669.0, 33670.0, 33671.0 |

### `vct_2025\ids\tournaments_stages_matches_games_ids.csv`

- Rows: 1,277 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2025, VCT 2025: Americas Stage 2, VCT 2025: EMEA Stage 2, VCT 2025: Pacific Stage 2, VCT 2025: China Stage 2 |
| Tournament ID | int64 | 0.0% | 2283, 2501, 2498, 2500, 2499 |
| Stage | object | 0.0% | Group Stage, Playoffs, Showmatch, Swiss Stage, Main Event |
| Stage ID | int64 | 0.0% | 5079, 5080, 4859, 4861, 5097 |
| Match Type | object | 0.0% | Opening (A), Opening (C), Opening (D), Opening (B), Winner's (A) |
| Match Name | object | 0.0% | Paper Rex vs Xi Lai Gaming, GIANTX vs Sentinels, NRG vs EDward Gaming, Team Liquid vs DRX, Dragon Ranger Gaming vs T1 |
| Match ID | int64 | 0.0% | 542195, 542196, 542207, 542205, 542212 |
| Map | object | 0.0% | Bind, Sunset, Corrode, Haven, Abyss |
| Game ID | int64 | 0.0% | 233397, 233398, 233400, 233401, 233402 |

### `vct_2025\matches\draft_phase.csv`

- Rows: 2,988 | Columns: 7


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2025, VCT 2025: Americas Stage 2, VCT 2025: EMEA Stage 2, VCT 2025: Pacific Stage 2, VCT 2025: China Stage 2 |
| Stage | object | 0.0% | Group Stage, Playoffs, Swiss Stage, Main Event |
| Match Type | object | 0.0% | Opening (A), Opening (C), Opening (D), Opening (B), Winner's (A) |
| Match Name | object | 0.0% | Paper Rex vs Xi Lai Gaming, GIANTX vs Sentinels, NRG vs EDward Gaming, Team Liquid vs DRX, Dragon Ranger Gaming vs T1 |
| Team | object | 0.0% | Xi Lai Gaming, Paper Rex, Sentinels, GIANTX, EDward Gaming |
| Action | object | 0.0% | ban, pick |
| Map | object | 0.0% | Lotus, Abyss, Bind, Sunset, Corrode |

### `vct_2025\matches\eco_rounds.csv`

- Rows: 25,182 | Columns: 11


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Masters Toronto 2025, Champions Tour 2025: EMEA Stage 1, Champions Tour 2025: Pacific Stage 1, Champions Tour 2025: Americas Stage 1, Champions Tour 2025: Masters Bangkok |
| Stage | object | 0.0% | Swiss Stage, Playoffs, Group Stage, Main Event |
| Match Type | object | 0.0% | Round 1, Round 2 (1-0), Round 2 (0-1), Round 3 (1-1), Upper Quarterfinals |
| Match Name | object | 0.0% | Team Heretics vs Paper Rex, Bilibili Gaming vs Team Liquid, Sentinels vs Wolves Esports, Gen.G vs MIBR, Bilibili Gaming vs Sentinels |
| Map | object | 0.0% | Pearl, Icebox, Haven, Sunset, Split |
| Round Number | int64 | 0.0% | 1, 2, 3, 4, 5 |
| Team | object | 0.0% | Team Heretics, Paper Rex, Bilibili Gaming, Team Liquid, Sentinels |
| Loadout Value | object | 10.1% | 3.9k, 3.7k, 13.5k, 2.9k, 16.7k |
| Remaining Credits | object | 0.0% | 0.2k, 0.5k, 10.2k, 2.3k, 10.9k |
| Type | object | 0.0% | Eco: 0-5k, Semi-buy: 10-20k, Full buy: 20k+, Semi-eco: 5-10k |
| Outcome | object | 0.0% | Loss, Win |

### `vct_2025\matches\eco_stats.csv`

- Rows: 13,940 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2025, VCT 2025: Americas Stage 2, VCT 2025: EMEA Stage 2, VCT 2025: Pacific Stage 2, Valorant Masters Toronto 2025 |
| Stage | object | 0.0% | Group Stage, Playoffs, Showmatch, Swiss Stage, Main Event |
| Match Type | object | 0.0% | Opening (A), Opening (C), Opening (D), Opening (B), Winner's (A) |
| Match Name | object | 0.0% | Paper Rex vs Xi Lai Gaming, GIANTX vs Sentinels, NRG vs EDward Gaming, Team Liquid vs DRX, Dragon Ranger Gaming vs T1 |
| Map | object | 0.0% | Bind, Sunset, All Maps, Corrode, Haven |
| Team | object | 0.0% | Paper Rex, Xi Lai Gaming, GIANTX, Sentinels, Mega Minors |
| Type | object | 0.0% | Pistol Won, Eco (won), $ (won), $$ (won), $$$ (won) |
| Initiated | float64 | 20.0% | 4.0, 0.0, 3.0, 15.0, 1.0 |
| Won | int64 | 0.0% | 1, 2, 0, 9, 3 |

### `vct_2025\matches\kills.csv`

- Rows: 104,325 | Columns: 13


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2025, VCT 2025: Americas Stage 2, VCT 2025: EMEA Stage 2, VCT 2025: Pacific Stage 2, Valorant Masters Toronto 2025 |
| Stage | object | 0.0% | Group Stage, Playoffs, Swiss Stage, Main Event |
| Match Type | object | 0.0% | Opening (A), Opening (C), Opening (D), Opening (B), Winner's (A) |
| Match Name | object | 0.0% | Paper Rex vs Xi Lai Gaming, GIANTX vs Sentinels, NRG vs EDward Gaming, Team Liquid vs DRX, Dragon Ranger Gaming vs T1 |
| Map | object | 0.0% | All Maps, Bind, Sunset, Corrode, Haven |
| Player Team | object | 0.0% | Paper Rex, GIANTX, Mega Minors, Team Liquid, Dragon Ranger Gaming |
| Player | object | 0.0% | PatMen, d4v41, something, f0rsakeN, Jinggg |
| Enemy Team | object | 0.0% | Xi Lai Gaming, Sentinels, EDward Gaming, DRX, T1 |
| Enemy | object | 0.0% | NoMan, happywei, Viva, coconut, Rarga |
| Player Kills | float64 | 41.6% | 4.0, 3.0, 5.0, 6.0, 10.0 |
| Enemy Kills | float64 | 41.6% | 6.0, 7.0, 2.0, 5.0, 9.0 |
| Difference | float64 | 41.7% | -2.0, -4.0, 1.0, 0.0, -3.0 |
| Kill Type | object | 0.0% | All Kills, First Kills, Op Kills |

### `vct_2025\matches\kills_stats.csv`

- Rows: 13,912 | Columns: 20


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2025, VCT 2025: Americas Stage 2, VCT 2025: EMEA Stage 2, VCT 2025: Pacific Stage 2, Valorant Masters Toronto 2025 |
| Stage | object | 0.0% | Group Stage, Playoffs, Swiss Stage, Main Event |
| Match Type | object | 0.0% | Opening (A), Opening (C), Opening (D), Opening (B), Winner's (A) |
| Match Name | object | 0.0% | Paper Rex vs Xi Lai Gaming, GIANTX vs Sentinels, NRG vs EDward Gaming, Team Liquid vs DRX, Dragon Ranger Gaming vs T1 |
| Map | object | 0.0% | All Maps, Bind, Sunset, Corrode, Haven |
| Team | object | 0.0% | Paper Rex, Xi Lai Gaming, GIANTX, Sentinels, Mega Minors |
| Player | object | 0.0% | Jinggg, f0rsakeN, d4v41, PatMen, something |
| Agents | object | 0.0% | raze, brimstone, omen, sage, viper, fade, viper, sova, yoru |
| 2k | float64 | 5.9% | 8.0, 5.0, 2.0, 4.0, 7.0 |
| 3k | float64 | 37.4% | 5.0, 1.0, 2.0, 3.0, 4.0 |
| 4k | float64 | 79.6% | 3.0, 1.0, 2.0, 4.0, 5.0 |
| 5k | float64 | 97.1% | 1.0, 3.0, 2.0 |
| 1v1 | float64 | 75.4% | 3.0, 1.0, 2.0, 4.0, 5.0 |
| 1v2 | float64 | 86.1% | 1.0, 2.0, 4.0, 3.0 |
| 1v3 | float64 | 96.1% | 1.0, 2.0, 3.0 |
| 1v4 | float64 | 99.3% | 1.0 |
| 1v5 | float64 | 99.9% | 1.0 |
| Econ | int64 | 0.0% | 73, 66, 43, 36, 78 |
| Spike Plants | int64 | 0.0% | 0, 1, 5, 4, 9 |
| Spike Defuses | int64 | 0.0% | 2, 0, 3, 1, 5 |

### `vct_2025\matches\maps_played.csv`

- Rows: 1,277 | Columns: 5


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2025, VCT 2025: Americas Stage 2, VCT 2025: EMEA Stage 2, VCT 2025: Pacific Stage 2, VCT 2025: China Stage 2 |
| Stage | object | 0.0% | Group Stage, Playoffs, Showmatch, Swiss Stage, Main Event |
| Match Type | object | 0.0% | Opening (A), Opening (C), Opening (D), Opening (B), Winner's (A) |
| Match Name | object | 0.0% | Paper Rex vs Xi Lai Gaming, GIANTX vs Sentinels, NRG vs EDward Gaming, Team Liquid vs DRX, Dragon Ranger Gaming vs T1 |
| Map | object | 0.0% | Bind, Sunset, Corrode, Haven, Abyss |

### `vct_2025\matches\maps_scores.csv`

- Rows: 1,277 | Columns: 16


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2025, VCT 2025: Americas Stage 2, VCT 2025: EMEA Stage 2, VCT 2025: Pacific Stage 2, VCT 2025: China Stage 2 |
| Stage | object | 0.0% | Group Stage, Playoffs, Showmatch, Swiss Stage, Main Event |
| Match Type | object | 0.0% | Opening (A), Opening (C), Opening (D), Opening (B), Winner's (A) |
| Match Name | object | 0.0% | Paper Rex vs Xi Lai Gaming, GIANTX vs Sentinels, NRG vs EDward Gaming, Team Liquid vs DRX, Dragon Ranger Gaming vs T1 |
| Map | object | 0.0% | Bind, Sunset, Corrode, Haven, Abyss |
| Team A | object | 0.0% | Paper Rex, GIANTX, Mega Minors, Team Liquid, Dragon Ranger Gaming |
| Team A Score | int64 | 0.0% | 13, 6, 17, 8, 10 |
| Team A Attacker Score | int64 | 0.0% | 6, 8, 10, 4, 2 |
| Team A Defender Score | int64 | 0.0% | 7, 5, 0, 3, 9 |
| Team A Overtime Score | float64 | 88.6% | 5.0, 1.0, 2.0, 3.0, 0.0 |
| Team B | object | 0.0% | Xi Lai Gaming, Sentinels, EDward Gaming, DRX, T1 |
| Team B Score | int64 | 0.0% | 9, 5, 13, 4, 15 |
| Team B Attacker Score | int64 | 0.0% | 3, 1, 7, 2, 5 |
| Team B Defender Score | int64 | 0.0% | 6, 4, 2, 8, 10 |
| Team B Overtime Score | float64 | 88.6% | 3.0, 4.0, 1.0, 0.0, 2.0 |
| Duration | object | 7.7% | 48:56, 39:04, 41:17, 38:15, 51:34 |

### `vct_2025\matches\overview.csv`

- Rows: 53,226 | Columns: 21


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2025, VCT 2025: Americas Stage 2, VCT 2025: EMEA Stage 2, VCT 2025: Pacific Stage 2, VCT 2025: China Stage 2 |
| Stage | object | 0.0% | Group Stage, Playoffs, Showmatch, Swiss Stage, Main Event |
| Match Type | object | 0.0% | Opening (A), Opening (C), Opening (D), Opening (B), Winner's (A) |
| Match Name | object | 0.0% | Paper Rex vs Xi Lai Gaming, GIANTX vs Sentinels, NRG vs EDward Gaming, Team Liquid vs DRX, Dragon Ranger Gaming vs T1 |
| Map | object | 0.0% | Bind, All Maps, Sunset, Corrode, Haven |
| Player | object | 0.0% | something, Jinggg, f0rsakeN, d4v41, PatMen |
| Team | object | 0.0% | Paper Rex, Xi Lai Gaming, GIANTX, Sentinels, Mega Minors |
| Agents | object | 0.0% | yoru, raze, brimstone, viper, fade |
| Rating | float64 | 7.7% | 1.63, 1.33, 1.88, 1.52, 1.11 |
| Average Combat Score | float64 | 5.2% | 258.0, 199.0, 308.0, 315.0, 239.0 |
| Kills | float64 | 4.8% | 21.0, 7.0, 14.0, 24.0, 8.0 |
| Deaths | float64 | 4.8% | 12.0, 5.0, 7.0, 14.0, 13.0 |
| Assists | float64 | 4.8% | 12.0, 6.0, 7.0, 2.0, 5.0 |
| Kills - Deaths (KD) | float64 | 4.8% | 9.0, 2.0, 7.0, 10.0, 1.0 |
| Kill, Assist, Trade, Survive % | object | 7.3% | 91%, 100%, 83%, 82%, 80% |
| Average Damage Per Round | float64 | 7.6% | 167.0, 137.0, 192.0, 207.0, 148.0 |
| Headshot % | object | 7.2% | 15%, 16%, 13%, 18%, 21% |
| First Kills | float64 | 7.4% | 4.0, 1.0, 3.0, 5.0, 2.0 |
| First Deaths | float64 | 7.4% | 0.0, 2.0, 5.0, 1.0, 4.0 |
| Kills - Deaths (FKD) | float64 | 7.4% | 4.0, 1.0, 3.0, 2.0, -3.0 |
| Side | object | 0.0% | both, attack, defend |

### `vct_2025\matches\rounds_kills.csv`

- Rows: 89,088 | Columns: 13


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2025, VCT 2025: Americas Stage 2, VCT 2025: EMEA Stage 2, VCT 2025: Pacific Stage 2, Valorant Masters Toronto 2025 |
| Stage | object | 0.0% | Group Stage, Playoffs, Swiss Stage, Main Event |
| Match Type | object | 0.0% | Opening (A), Opening (C), Opening (D), Opening (B), Winner's (A) |
| Match Name | object | 0.0% | Paper Rex vs Xi Lai Gaming, GIANTX vs Sentinels, NRG vs EDward Gaming, Team Liquid vs DRX, Dragon Ranger Gaming vs T1 |
| Map | object | 0.0% | Bind, Sunset, Corrode, Haven, Abyss |
| Round Number | int64 | 0.0% | 3, 5, 13, 14, 21 |
| Eliminator Team | object | 0.0% | Paper Rex, Xi Lai Gaming, GIANTX, Sentinels, Mega Minors |
| Eliminator | object | 0.0% | Jinggg, f0rsakeN, d4v41, PatMen, something |
| Eliminator Agent | object | 0.0% | raze, brimstone, viper, fade, yoru |
| Eliminated Team | object | 0.0% | Xi Lai Gaming, Paper Rex, Sentinels, GIANTX, EDward Gaming |
| Eliminated | object | 0.0% | coconut, NoMan, Rarga, Viva, happywei |
| Eliminated Agent | object | 0.0% | gekko, skye, raze, brimstone, viper |
| Kill Type | object | 0.0% | 2k, 3k, 4k, 1v2, 1v4 |

### `vct_2025\matches\scores.csv`

- Rows: 503 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2025, VCT 2025: Americas Stage 2, VCT 2025: EMEA Stage 2, VCT 2025: Pacific Stage 2, VCT 2025: China Stage 2 |
| Stage | object | 0.0% | Group Stage, Playoffs, Showmatch, Swiss Stage, Main Event |
| Match Type | object | 0.0% | Opening (A), Opening (C), Opening (D), Opening (B), Winner's (A) |
| Match Name | object | 0.0% | Paper Rex vs Xi Lai Gaming, GIANTX vs Sentinels, NRG vs EDward Gaming, Team Liquid vs DRX, Dragon Ranger Gaming vs T1 |
| Team A | object | 0.0% | Paper Rex, GIANTX, Mega Minors, Team Liquid, Dragon Ranger Gaming |
| Team B | object | 0.0% | Xi Lai Gaming, Sentinels, EDward Gaming, DRX, T1 |
| Team A Score | int64 | 0.0% | 2, 0, 1, 3, 13 |
| Team B Score | int64 | 0.0% | 0, 1, 2, 4, 3 |
| Match Result | object | 0.0% | Paper Rex won, GIANTX won, NRG won, DRX won, T1 won |

### `vct_2025\matches\team_mapping.csv`

- Rows: 58 | Columns: 2


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Abbreviated | object | 0.0% | PRX, XLG, GX, SEN, NRG |
| Full Name | object | 0.0% | Paper Rex, Xi Lai Gaming, GIANTX, Sentinels, NRG |

### `vct_2025\matches\win_loss_methods_count.csv`

- Rows: 2,554 | Columns: 14


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2025, VCT 2025: Americas Stage 2, VCT 2025: EMEA Stage 2, VCT 2025: Pacific Stage 2, VCT 2025: China Stage 2 |
| Stage | object | 0.0% | Group Stage, Playoffs, Showmatch, Swiss Stage, Main Event |
| Match Type | object | 0.0% | Opening (A), Opening (C), Opening (D), Opening (B), Winner's (A) |
| Match Name | object | 0.0% | Paper Rex vs Xi Lai Gaming, GIANTX vs Sentinels, NRG vs EDward Gaming, Team Liquid vs DRX, Dragon Ranger Gaming vs T1 |
| Map | object | 0.0% | Bind, Sunset, Corrode, Haven, Abyss |
| Team | object | 0.0% | Paper Rex, Xi Lai Gaming, GIANTX, Sentinels, Mega Minors |
| Elimination | int64 | 0.0% | 8, 3, 9, 4, 10 |
| Detonated | int64 | 0.0% | 1, 3, 0, 2, 4 |
| Defused | int64 | 0.0% | 3, 2, 4, 0, 1 |
| Time Expiry (No Plant) | int64 | 0.0% | 1, 0, 3, 2, 4 |
| Eliminated | int64 | 0.0% | 3, 8, 9, 4, 10 |
| Defused Failed | int64 | 0.0% | 3, 1, 2, 0, 4 |
| Detonation Denied | int64 | 0.0% | 2, 3, 0, 4, 1 |
| Time Expiry (Failed to Plant) | int64 | 0.0% | 1, 0, 3, 2, 4 |

### `vct_2025\matches\win_loss_methods_round_number.csv`

- Rows: 53,950 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2025, VCT 2025: Americas Stage 2, VCT 2025: EMEA Stage 2, VCT 2025: Pacific Stage 2, VCT 2025: China Stage 2 |
| Stage | object | 0.0% | Group Stage, Playoffs, Showmatch, Swiss Stage, Main Event |
| Match Type | object | 0.0% | Opening (A), Opening (C), Opening (D), Opening (B), Winner's (A) |
| Match Name | object | 0.0% | Paper Rex vs Xi Lai Gaming, GIANTX vs Sentinels, NRG vs EDward Gaming, Team Liquid vs DRX, Dragon Ranger Gaming vs T1 |
| Map | object | 0.0% | Bind, Sunset, Corrode, Haven, Abyss |
| Round Number | int64 | 0.0% | 1, 2, 3, 4, 5 |
| Team | object | 0.0% | Xi Lai Gaming, Paper Rex, GIANTX, Sentinels, EDward Gaming |
| Method | object | 0.0% | Elimination, Eliminated, Detonated, Failed Defused, Defused |
| Outcome | object | 0.0% | Win, Loss |

### `vct_2025\players_stats\players_stats.csv`

- Rows: 17,996 | Columns: 25


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Champions 2025, VCT 2025: EMEA Stage 2, VCT 2025: Americas Stage 2, VCT 2025: Pacific Stage 2, VCT 2025: China Stage 2 |
| Stage | object | 0.0% | Playoffs, Group Stage, All Stages, Swiss Stage, Main Event |
| Match Type | object | 0.0% | Upper Quarterfinals, Upper Semifinals, Upper Final, Grand Final, Lower Round 1 |
| Player | object | 0.0% | Boo, RieNs, Wo0t, benjyfishy, MiniBoo |
| Teams | object | 0.0% | Team Heretics, GIANTX, G2 Esports, MIBR, DRX |
| Agents | object | 0.0% | astra, omen, astra, omen, fade, sova |
| Rounds Played | int64 | 0.0% | 26, 19, 45, 14, 33 |
| Rating | float64 | 7.7% | 0.68, 0.46, 0.59, 1.21, 1.02 |
| Average Combat Score | float64 | 0.1% | 129.0, 98.0, 114.0, 219.0, 220.0 |
| Kills:Deaths | float64 | 0.0% | 0.61, 0.4, 0.52, 1.13, 0.75 |
| Kill, Assist, Trade, Survive % | object | 7.2% | 69%, 42%, 58%, 81%, 71% |
| Average Damage Per Round | float64 | 7.6% | 89.0, 55.0, 74.0, 147.0, 142.0 |
| Kills Per Round | float64 | 0.0% | 0.42, 0.32, 0.38, 0.69, 0.63 |
| Assists Per Round | float64 | 0.0% | 0.15, 0.26, 0.2, 0.38, 0.33 |
| First Kills Per Round | float64 | 7.5% | 0.12, 0.05, 0.09, 0.08, 0.07 |
| First Deaths Per Round | float64 | 7.5% | 0.12, 0.26, 0.18, 0.04, 0.05 |
| Headshot % | object | 7.3% | 44%, 37%, 41%, 23%, 28% |
| Clutch Success % | object | 63.0% | 33%, 14%, 29%, 13%, 67% |
| Clutches (won/played) | object | 26.3% | 0/4, 1/3, 1/7, 2/7, 1/8 |
| Maximum Kills in a Single Map | int64 | 0.0% | 11, 6, 18, 12, 16 |
| Kills | int64 | 0.0% | 11, 6, 17, 18, 12 |
| Deaths | int64 | 0.0% | 18, 15, 33, 16, 32 |
| Assists | int64 | 0.0% | 4, 5, 9, 10, 15 |
| First Kills | int64 | 0.0% | 3, 1, 4, 2, 6 |
| First Deaths | int64 | 0.0% | 3, 5, 8, 1, 2 |

## vct_2026


### `vct_2026\agents\agents_pick_rates.csv`

- Rows: 21,547 | Columns: 6


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | VCT 2026: Americas Stage 1, VCT 2026: EMEA Stage 1, VCT 2026: China Stage 1, Valorant Masters Santiago 2026, VCT 2026: Pacific Stage 1 |
| Stage | object | 0.0% | Playoffs, Group Stage, All Stages, Swiss Stage, Main Event |
| Match Type | object | 0.0% | Upper Round 1, Upper Semifinals, Upper Final, Grand Final, Lower Round 1 |
| Map | object | 0.0% | All Maps, Pearl, Lotus, Breeze, Split |
| Agent | object | 0.0% | neon, fade, phoenix, omen, astra |
| Pick Rate | object | 0.0% | 80%, 70%, 50%, 40%, 30% |

### `vct_2026\agents\maps_stats.csv`

- Rows: 743 | Columns: 7


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | VCT 2026: Americas Stage 1, VCT 2026: EMEA Stage 1, VCT 2026: China Stage 1, Valorant Masters Santiago 2026, VCT 2026: Pacific Stage 1 |
| Stage | object | 0.0% | Playoffs, Group Stage, All Stages, Swiss Stage, Main Event |
| Match Type | object | 0.0% | Upper Round 1, Upper Semifinals, Upper Final, Grand Final, Lower Round 1 |
| Map | object | 0.0% | All Maps, Pearl, Lotus, Breeze, Split |
| Total Maps Played | int64 | 0.0% | 5, 2, 1, 3, 4 |
| Attacker Side Win Percentage | object | 0.0% | 44%, 39%, 45%, 48%, 50% |
| Defender Side Win Percentage | object | 0.0% | 56%, 61%, 55%, 52%, 50% |

### `vct_2026\agents\teams_picked_agents.csv`

- Rows: 11,848 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | VCT 2026: Americas Stage 1, VCT 2026: EMEA Stage 1, VCT 2026: China Stage 1, Valorant Masters Santiago 2026, VCT 2026: Pacific Stage 1 |
| Stage | object | 0.0% | Playoffs, Group Stage, All Stages, Swiss Stage, Main Event |
| Match Type | object | 0.0% | Upper Round 1, Upper Semifinals, Upper Final, Grand Final, Lower Round 1 |
| Map | object | 0.0% | Breeze, Split, Pearl, Lotus, Fracture |
| Team | object | 0.0% | FURIA, LEVIATÁN, G2 Esports, 100 Thieves, MIBR |
| Agent | object | 0.0% | viper, sova, jett, harbor, kayo |
| Total Wins By Map | int64 | 0.0% | 1, 0, 5, 3, 4 |
| Total Loss By Map | int64 | 0.0% | 0, 1, 2, 4, 3 |
| Total Maps Played | int64 | 0.0% | 1, 6, 5, 2, 3 |

### `vct_2026\ids\players_ids.csv`

- Rows: 284 | Columns: 2


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Player | object | 0.0% | NoMan, Lysoar, happywei, Rarga, WsLeo |
| Player ID | int64 | 0.0% | 11527, 37489, 37927, 22047, 24308 |

### `vct_2026\ids\teams_ids.csv`

- Rows: 49 | Columns: 2


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Team | object | 0.0% | Xi Lai Gaming, NRG, Team Vitality, Dragon Ranger Gaming, FULL SENSE |
| Team ID | int64 | 0.0% | 13581, 1034, 2059, 11981, 4050 |

### `vct_2026\ids\tournaments_stages_match_types_ids.csv`

- Rows: 132 | Columns: 6


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | VCT 2026: Americas Stage 1, VCT 2026: EMEA Stage 1, VCT 2026: China Stage 1, Valorant Masters Santiago 2026, VCT 2026: Pacific Stage 1 |
| Tournament ID | int64 | 0.0% | 2860, 2863, 2864, 2760, 2775 |
| Stage | object | 0.0% | Playoffs, Group Stage, All Stages, Swiss Stage, Main Event |
| Stage ID | float64 | 6.8% | 5557.0, 5556.0, 5560.0, 5561.0, 5606.0 |
| Match Type | object | 0.0% | Upper Round 1, Upper Semifinals, Upper Final, Grand Final, Lower Round 1 |
| Match Type ID | float64 | 6.8% | 37954.0, 37955.0, 37956.0, 37957.0, 37958.0 |

### `vct_2026\ids\tournaments_stages_matches_games_ids.csv`

- Rows: 886 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Masters London 2026, VCT 2026: Americas Stage 1, VCT 2026: EMEA Stage 1, VCT 2026: Pacific Stage 1, VCT 2026: China Stage 1 |
| Tournament ID | int64 | 0.0% | 2765, 2860, 2863, 2775, 2864 |
| Stage | object | 0.0% | Swiss Stage, Playoffs, Group Stage, Main Event |
| Stage ID | int64 | 0.0% | 5767, 5768, 5556, 5557, 5561 |
| Match Type | object | 0.0% | Round 1, Round 2 (1-0), Round 2 (0-1), Round 3 (1-1), Upper Quarterfinals |
| Match Name | object | 0.0% | Xi Lai Gaming vs NRG, Team Vitality vs Dragon Ranger Gaming, FULL SENSE vs FUT Esports, LEVIATÁN vs Global Esports, Team Vitality vs FUT Esports |
| Match ID | int64 | 0.0% | 684613, 684610, 684611, 684612, 684614 |
| Map | object | 0.0% | Pearl, Lotus, Breeze, Fracture, Haven |
| Game ID | int64 | 0.0% | 270746, 270747, 270737, 270738, 270740 |

### `vct_2026\matches\draft_phase.csv`

- Rows: 2,052 | Columns: 7


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Masters London 2026, VCT 2026: Americas Stage 1, VCT 2026: EMEA Stage 1, VCT 2026: Pacific Stage 1, VCT 2026: China Stage 1 |
| Stage | object | 0.0% | Swiss Stage, Playoffs, Group Stage, Main Event |
| Match Type | object | 0.0% | Round 1, Round 2 (1-0), Round 2 (0-1), Round 3 (1-1), Upper Quarterfinals |
| Match Name | object | 0.0% | Xi Lai Gaming vs NRG, Team Vitality vs Dragon Ranger Gaming, FULL SENSE vs FUT Esports, LEVIATÁN vs Global Esports, Team Vitality vs FUT Esports |
| Team | object | 0.0% | Mega Minors, Xi Lai Gaming, Dragon Ranger Gaming, Team Vitality, FULL SENSE |
| Action | object | 0.0% | ban, pick |
| Map | object | 0.0% | Split, Breeze, Pearl, Lotus, Ascent |

### `vct_2026\matches\eco_rounds.csv`

- Rows: 28,944 | Columns: 11


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Masters London 2026, VCT 2026: Americas Stage 1, VCT 2026: EMEA Stage 1, VCT 2026: Pacific Stage 1, Valorant Masters Santiago 2026 |
| Stage | object | 0.0% | Swiss Stage, Playoffs, Group Stage, Main Event |
| Match Type | object | 0.0% | Round 1, Round 2 (1-0), Round 2 (0-1), Round 3 (1-1), Upper Quarterfinals |
| Match Name | object | 0.0% | Xi Lai Gaming vs NRG, Team Vitality vs Dragon Ranger Gaming, FULL SENSE vs FUT Esports, LEVIATÁN vs Global Esports, Team Vitality vs FUT Esports |
| Map | object | 0.0% | Pearl, Lotus, Breeze, Fracture, Haven |
| Round Number | int64 | 0.0% | 1, 2, 3, 4, 5 |
| Team | object | 0.0% | Xi Lai Gaming, Mega Minors, Team Vitality, Dragon Ranger Gaming, FULL SENSE |
| Loadout Value | float64 | 100.0% |  |
| Remaining Credits | object | 0.0% | 0.3k, 0.1k, 9.8k, 4.8k, 9.6k |
| Type | object | 0.0% | Eco: 0-5k, Semi-buy: 10-20k, Full buy: 20k+, Semi-eco: 5-10k |
| Outcome | object | 0.0% | Loss, Win |

### `vct_2026\matches\eco_stats.csv`

- Rows: 9,440 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Masters London 2026, VCT 2026: Americas Stage 1, VCT 2026: EMEA Stage 1, VCT 2026: Pacific Stage 1, Valorant Masters Santiago 2026 |
| Stage | object | 0.0% | Swiss Stage, Playoffs, Group Stage, Main Event |
| Match Type | object | 0.0% | Round 1, Round 2 (1-0), Round 2 (0-1), Round 3 (1-1), Upper Quarterfinals |
| Match Name | object | 0.0% | Xi Lai Gaming vs NRG, Team Vitality vs Dragon Ranger Gaming, FULL SENSE vs FUT Esports, LEVIATÁN vs Global Esports, Team Vitality vs FUT Esports |
| Map | object | 0.0% | Pearl, Lotus, All Maps, Breeze, Fracture |
| Team | object | 0.0% | Xi Lai Gaming, Mega Minors, Team Vitality, Dragon Ranger Gaming, FULL SENSE |
| Type | object | 0.0% | Pistol Won, Eco (won), $ (won), $$ (won), $$$ (won) |
| Initiated | float64 | 20.0% | 4.0, 3.0, 1.0, 11.0, 2.0 |
| Won | int64 | 0.0% | 0, 1, 5, 2, 6 |

### `vct_2026\matches\kills.csv`

- Rows: 70,800 | Columns: 13


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Masters London 2026, VCT 2026: Americas Stage 1, VCT 2026: EMEA Stage 1, VCT 2026: Pacific Stage 1, Valorant Masters Santiago 2026 |
| Stage | object | 0.0% | Swiss Stage, Playoffs, Group Stage, Main Event |
| Match Type | object | 0.0% | Round 1, Round 2 (1-0), Round 2 (0-1), Round 3 (1-1), Upper Quarterfinals |
| Match Name | object | 0.0% | Xi Lai Gaming vs NRG, Team Vitality vs Dragon Ranger Gaming, FULL SENSE vs FUT Esports, LEVIATÁN vs Global Esports, Team Vitality vs FUT Esports |
| Map | object | 0.0% | All Maps, Pearl, Lotus, Breeze, Fracture |
| Player Team | object | 0.0% | Xi Lai Gaming, Team Vitality, FULL SENSE, LEVIATÁN, Mega Minors |
| Player | object | 0.0% | happywei, NoMan, Lysoar, Rarga, WsLeo |
| Enemy Team | object | 0.0% | Mega Minors, Dragon Ranger Gaming, FUT Esports, Global Esports, LEVIATÁN |
| Enemy | object | 0.0% | skuba, Ethan, mada, brawk, keiko |
| Player Kills | float64 | 40.2% | 5.0, 12.0, 7.0, 6.0, 3.0 |
| Enemy Kills | float64 | 40.2% | 6.0, 8.0, 4.0, 9.0, 2.0 |
| Difference | float64 | 40.3% | -1.0, 4.0, 1.0, -2.0, 0.0 |
| Kill Type | object | 0.0% | All Kills, First Kills, Op Kills |

### `vct_2026\matches\kills_stats.csv`

- Rows: 9,440 | Columns: 20


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Masters London 2026, VCT 2026: Americas Stage 1, VCT 2026: EMEA Stage 1, VCT 2026: Pacific Stage 1, Valorant Masters Santiago 2026 |
| Stage | object | 0.0% | Swiss Stage, Playoffs, Group Stage, Main Event |
| Match Type | object | 0.0% | Round 1, Round 2 (1-0), Round 2 (0-1), Round 3 (1-1), Upper Quarterfinals |
| Match Name | object | 0.0% | Xi Lai Gaming vs NRG, Team Vitality vs Dragon Ranger Gaming, FULL SENSE vs FUT Esports, LEVIATÁN vs Global Esports, Team Vitality vs FUT Esports |
| Map | object | 0.0% | All Maps, Pearl, Lotus, Breeze, Fracture |
| Team | object | 0.0% | Xi Lai Gaming, Mega Minors, Team Vitality, Dragon Ranger Gaming, FULL SENSE |
| Player | object | 0.0% | NoMan, Rarga, WsLeo, Lysoar, happywei |
| Agents | object | 0.0% | deadlock, jett, phoenix, sage, fade, astra, omen, cypher, vyse |
| 2k | float64 | 5.7% | 5.0, 4.0, 7.0, 1.0, 3.0 |
| 3k | float64 | 37.2% | 2.0, 1.0, 3.0, 10.0, 7.0 |
| 4k | float64 | 79.6% | 1.0, 2.0, 3.0, 4.0 |
| 5k | float64 | 97.2% | 1.0, 2.0 |
| 1v1 | float64 | 76.0% | 1.0, 2.0, 3.0, 4.0, 5.0 |
| 1v2 | float64 | 87.4% | 1.0, 2.0, 3.0 |
| 1v3 | float64 | 96.9% | 1.0, 2.0 |
| 1v4 | float64 | 99.3% | 1.0 |
| 1v5 | float64 | 100.0% | 1.0 |
| Econ | int64 | 0.0% | 52, 41, 48, 44, 49 |
| Spike Plants | int64 | 0.0% | 0, 11, 2, 1, 5 |
| Spike Defuses | int64 | 0.0% | 1, 0, 5, 2, 3 |

### `vct_2026\matches\maps_played.csv`

- Rows: 886 | Columns: 5


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Masters London 2026, VCT 2026: Americas Stage 1, VCT 2026: EMEA Stage 1, VCT 2026: Pacific Stage 1, VCT 2026: China Stage 1 |
| Stage | object | 0.0% | Swiss Stage, Playoffs, Group Stage, Main Event |
| Match Type | object | 0.0% | Round 1, Round 2 (1-0), Round 2 (0-1), Round 3 (1-1), Upper Quarterfinals |
| Match Name | object | 0.0% | Xi Lai Gaming vs NRG, Team Vitality vs Dragon Ranger Gaming, FULL SENSE vs FUT Esports, LEVIATÁN vs Global Esports, Team Vitality vs FUT Esports |
| Map | object | 0.0% | Pearl, Lotus, Breeze, Fracture, Haven |

### `vct_2026\matches\maps_scores.csv`

- Rows: 886 | Columns: 16


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Masters London 2026, VCT 2026: Americas Stage 1, VCT 2026: EMEA Stage 1, VCT 2026: Pacific Stage 1, VCT 2026: China Stage 1 |
| Stage | object | 0.0% | Swiss Stage, Playoffs, Group Stage, Main Event |
| Match Type | object | 0.0% | Round 1, Round 2 (1-0), Round 2 (0-1), Round 3 (1-1), Upper Quarterfinals |
| Match Name | object | 0.0% | Xi Lai Gaming vs NRG, Team Vitality vs Dragon Ranger Gaming, FULL SENSE vs FUT Esports, LEVIATÁN vs Global Esports, Team Vitality vs FUT Esports |
| Map | object | 0.0% | Pearl, Lotus, Breeze, Fracture, Haven |
| Team A | object | 0.0% | Xi Lai Gaming, Team Vitality, FULL SENSE, LEVIATÁN, Mega Minors |
| Team A Score | int64 | 0.0% | 6, 11, 13, 3, 7 |
| Team A Attacker Score | int64 | 0.0% | 5, 7, 8, 9, 3 |
| Team A Defender Score | int64 | 0.0% | 1, 4, 5, 0, 7 |
| Team A Overtime Score | float64 | 90.2% | 2.0, 1.0, 3.0, 0.0, 5.0 |
| Team B | object | 0.0% | Mega Minors, Dragon Ranger Gaming, FUT Esports, Global Esports, LEVIATÁN |
| Team B Score | int64 | 0.0% | 13, 5, 3, 11, 9 |
| Team B Attacker Score | int64 | 0.0% | 6, 8, 1, 0, 4 |
| Team B Defender Score | int64 | 0.0% | 7, 5, 4, 3, 9 |
| Team B Overtime Score | float64 | 90.2% | 0.0, 3.0, 1.0, 2.0, 4.0 |
| Duration | object | 2.0% | 44:32, 56:56, 43:10, 44:47, 33:55 |

### `vct_2026\matches\overview.csv`

- Rows: 36,840 | Columns: 21


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Masters London 2026, VCT 2026: Americas Stage 1, VCT 2026: EMEA Stage 1, VCT 2026: Pacific Stage 1, VCT 2026: China Stage 1 |
| Stage | object | 0.0% | Swiss Stage, Playoffs, Group Stage, Main Event |
| Match Type | object | 0.0% | Round 1, Round 2 (1-0), Round 2 (0-1), Round 3 (1-1), Upper Quarterfinals |
| Match Name | object | 0.0% | Xi Lai Gaming vs NRG, Team Vitality vs Dragon Ranger Gaming, FULL SENSE vs FUT Esports, LEVIATÁN vs Global Esports, Team Vitality vs FUT Esports |
| Map | object | 0.0% | Pearl, All Maps, Lotus, Breeze, Fracture |
| Player | object | 0.0% | NoMan, Lysoar, happywei, Rarga, WsLeo |
| Team | object | 0.0% | Xi Lai Gaming, Mega Minors, Team Vitality, Dragon Ranger Gaming, FULL SENSE |
| Agents | object | 0.0% | jett, astra, vyse, phoenix, fade |
| Rating | float64 | 2.0% | 1.17, 0.89, 1.34, 0.88, 0.36 |
| Average Combat Score | float64 | 1.3% | 236.0, 214.0, 249.0, 173.0, 58.0 |
| Kills | float64 | 1.2% | 15.0, 5.0, 10.0, 12.0, 1.0 |
| Deaths | float64 | 1.2% | 14.0, 6.0, 8.0, 15.0, 9.0 |
| Assists | float64 | 1.2% | 2.0, 1.0, 8.0, 6.0, 5.0 |
| Kills - Deaths (KD) | float64 | 1.3% | 1.0, -1.0, 2.0, -3.0, -5.0 |
| Kill, Assist, Trade, Survive % | object | 2.0% | 68%, 57%, 75%, 86%, 58% |
| Average Damage Per Round | float64 | 1.9% | 139.0, 121.0, 149.0, 116.0, 37.0 |
| Headshot % | object | 1.9% | 52%, 56%, 50%, 23%, 14% |
| First Kills | float64 | 1.8% | 2.0, 1.0, 0.0, 3.0, 4.0 |
| First Deaths | float64 | 1.8% | 3.0, 2.0, 1.0, 0.0, 4.0 |
| Kills - Deaths (FKD) | float64 | 1.8% | -1.0, 0.0, 1.0, -3.0, -2.0 |
| Side | object | 0.0% | both, attack, defend |

### `vct_2026\matches\rounds_kills.csv`

- Rows: 60,895 | Columns: 13


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Masters London 2026, VCT 2026: Americas Stage 1, VCT 2026: EMEA Stage 1, VCT 2026: Pacific Stage 1, Valorant Masters Santiago 2026 |
| Stage | object | 0.0% | Swiss Stage, Playoffs, Group Stage, Main Event |
| Match Type | object | 0.0% | Round 1, Round 2 (1-0), Round 2 (0-1), Round 3 (1-1), Upper Quarterfinals |
| Match Name | object | 0.0% | Xi Lai Gaming vs NRG, Team Vitality vs Dragon Ranger Gaming, FULL SENSE vs FUT Esports, LEVIATÁN vs Global Esports, Team Vitality vs FUT Esports |
| Map | object | 0.0% | Pearl, Lotus, Breeze, Fracture, Haven |
| Round Number | int64 | 0.0% | 1, 2, 6, 10, 17 |
| Eliminator Team | object | 0.0% | Xi Lai Gaming, Mega Minors, Team Vitality, Dragon Ranger Gaming, FULL SENSE |
| Eliminator | object | 0.0% | NoMan, Rarga, WsLeo, Lysoar, happywei |
| Eliminator Agent | object | 0.0% | jett, phoenix, fade, astra, vyse |
| Eliminated Team | object | 0.0% | Mega Minors, Xi Lai Gaming, Dragon Ranger Gaming, Team Vitality, FUT Esports |
| Eliminated | object | 0.0% | mada, keiko, brawk, skuba, Ethan |
| Eliminated Agent | object | 0.0% | waylay, vyse, sova, astra, tejo |
| Kill Type | object | 0.0% | 2k, 3k, 1v2, 4k, 1v1 |

### `vct_2026\matches\scores.csv`

- Rows: 342 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Masters London 2026, VCT 2026: Americas Stage 1, VCT 2026: EMEA Stage 1, VCT 2026: Pacific Stage 1, VCT 2026: China Stage 1 |
| Stage | object | 0.0% | Swiss Stage, Playoffs, Group Stage, Main Event |
| Match Type | object | 0.0% | Round 1, Round 2 (1-0), Round 2 (0-1), Round 3 (1-1), Upper Quarterfinals |
| Match Name | object | 0.0% | Xi Lai Gaming vs NRG, Team Vitality vs Dragon Ranger Gaming, FULL SENSE vs FUT Esports, LEVIATÁN vs Global Esports, Team Vitality vs FUT Esports |
| Team A | object | 0.0% | Xi Lai Gaming, Team Vitality, FULL SENSE, LEVIATÁN, Mega Minors |
| Team B | object | 0.0% | Mega Minors, Dragon Ranger Gaming, FUT Esports, Global Esports, LEVIATÁN |
| Team A Score | int64 | 0.0% | 0, 2, 1, 3 |
| Team B Score | int64 | 0.0% | 2, 0, 1, 3 |
| Match Result | object | 0.0% | NRG won, Team Vitality won, FUT Esports won, LEVIATÁN won, Xi Lai Gaming won |

### `vct_2026\matches\team_mapping.csv`

- Rows: 49 | Columns: 2


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Abbreviated | object | 0.0% | XLG, NRG, VIT, DRG, FS |
| Full Name | object | 0.0% | Xi Lai Gaming, NRG, Team Vitality, Dragon Ranger Gaming, FULL SENSE |

### `vct_2026\matches\win_loss_methods_count.csv`

- Rows: 1,772 | Columns: 14


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Masters London 2026, VCT 2026: Americas Stage 1, VCT 2026: EMEA Stage 1, VCT 2026: Pacific Stage 1, VCT 2026: China Stage 1 |
| Stage | object | 0.0% | Swiss Stage, Playoffs, Group Stage, Main Event |
| Match Type | object | 0.0% | Round 1, Round 2 (1-0), Round 2 (0-1), Round 3 (1-1), Upper Quarterfinals |
| Match Name | object | 0.0% | Xi Lai Gaming vs NRG, Team Vitality vs Dragon Ranger Gaming, FULL SENSE vs FUT Esports, LEVIATÁN vs Global Esports, Team Vitality vs FUT Esports |
| Map | object | 0.0% | Pearl, Lotus, Breeze, Fracture, Haven |
| Team | object | 0.0% | Xi Lai Gaming, Mega Minors, Team Vitality, Dragon Ranger Gaming, FULL SENSE |
| Elimination | int64 | 0.0% | 3, 6, 8, 7, 9 |
| Detonated | int64 | 0.0% | 0, 2, 1, 4, 3 |
| Defused | int64 | 0.0% | 3, 4, 1, 2, 0 |
| Time Expiry (No Plant) | int64 | 0.0% | 0, 1, 2, 3 |
| Eliminated | int64 | 0.0% | 6, 3, 7, 8, 9 |
| Defused Failed | int64 | 0.0% | 2, 0, 1, 4, 3 |
| Detonation Denied | int64 | 0.0% | 4, 3, 1, 2, 0 |
| Time Expiry (Failed to Plant) | int64 | 0.0% | 1, 0, 2, 3 |

### `vct_2026\matches\win_loss_methods_round_number.csv`

- Rows: 37,502 | Columns: 9


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Masters London 2026, VCT 2026: Americas Stage 1, VCT 2026: EMEA Stage 1, VCT 2026: Pacific Stage 1, VCT 2026: China Stage 1 |
| Stage | object | 0.0% | Swiss Stage, Playoffs, Group Stage, Main Event |
| Match Type | object | 0.0% | Round 1, Round 2 (1-0), Round 2 (0-1), Round 3 (1-1), Upper Quarterfinals |
| Match Name | object | 0.0% | Xi Lai Gaming vs NRG, Team Vitality vs Dragon Ranger Gaming, FULL SENSE vs FUT Esports, LEVIATÁN vs Global Esports, Team Vitality vs FUT Esports |
| Map | object | 0.0% | Pearl, Lotus, Breeze, Fracture, Haven |
| Round Number | int64 | 0.0% | 1, 2, 3, 4, 5 |
| Team | object | 0.0% | Mega Minors, Xi Lai Gaming, Team Vitality, Dragon Ranger Gaming, FUT Esports |
| Method | object | 0.0% | Elimination, Eliminated, Detonated, Failed Defused, Defused |
| Outcome | object | 0.0% | Win, Loss |

### `vct_2026\players_stats\players_stats.csv`

- Rows: 11,821 | Columns: 25


| Column | Dtype | Null % | Sample values |
|---|---|---|---|
| Tournament | object | 0.0% | Valorant Masters London 2026, VCT 2026: EMEA Stage 1, VCT 2026: Americas Stage 1, VCT 2026: China Stage 1, VCT 2026: Pacific Stage 1 |
| Stage | object | 0.0% | Playoffs, Swiss Stage, All Stages, Group Stage, Main Event |
| Match Type | object | 0.0% | Upper Quarterfinals, Upper Semifinals, Upper Final, Grand Final, Lower Round 1 |
| Player | object | 0.0% | CHICHOO, Jieni7, nobody, ZmjjKK, Smoggy |
| Teams | object | 0.0% | EDward Gaming, FUT Esports, G2 Esports, Team Heretics, LEVIATÁN |
| Agents | object | 0.0% | astra, cypher, omen, astra, cypher, omen, brimstone |
| Rounds Played | int64 | 0.0% | 26, 18, 17, 61, 44 |
| Rating | float64 | 1.6% | 1.27, 1.14, 0.84, 1.11, 1.39 |
| Average Combat Score | int64 | 0.0% | 204, 192, 131, 176, 187 |
| Kills:Deaths | float64 | 0.0% | 1.36, 1.56, 0.73, 1.21, 1.63 |
| Kill, Assist, Trade, Survive % | object | 1.5% | 69%, 78%, 53%, 67%, 62% |
| Average Damage Per Round | float64 | 1.5% | 136.0, 93.0, 124.0, 115.0, 96.0 |
| Kills Per Round | float64 | 0.0% | 0.73, 0.78, 0.47, 0.67, 0.72 |
| Assists Per Round | float64 | 0.0% | 0.46, 0.17, 0.12, 0.28, 0.44 |
| First Kills Per Round | float64 | 1.5% | 0.0, 0.11, 0.12, 0.07, 0.06 |
| First Deaths Per Round | float64 | 1.5% | 0.08, 0.06, 0.12, 0.0, 0.18 |
| Headshot % | object | 1.6% | 23%, 28%, 29%, 26%, 31% |
| Clutch Success % | object | 63.3% | 20%, 100%, 22%, 33%, 14% |
| Clutches (won/played) | object | 25.5% | 1/5, 1/1, 0/3, 2/9, 0/1 |
| Maximum Kills in a Single Map | int64 | 0.0% | 19, 14, 8, 13, 7 |
| Kills | int64 | 0.0% | 19, 14, 8, 41, 13 |
| Deaths | int64 | 0.0% | 14, 9, 11, 34, 8 |
| Assists | int64 | 0.0% | 12, 3, 2, 17, 8 |
| First Kills | int64 | 0.0% | 0, 2, 4, 1, 3 |
| First Deaths | int64 | 0.0% | 2, 1, 5, 0, 3 |


## Column cross-reference (all tables)

Columns appearing in more than one table, or with similar names across tables, are worth checking for naming consistency before schema design.


| Column name | Appears in |
|---|---|
| 1v1 | vct_2021\matches\kills_stats.csv, vct_2022\matches\kills_stats.csv, vct_2023\matches\kills_stats.csv, vct_2024\matches\kills_stats.csv, vct_2025\matches\kills_stats.csv, vct_2026\matches\kills_stats.csv |
| 1v2 | vct_2021\matches\kills_stats.csv, vct_2022\matches\kills_stats.csv, vct_2023\matches\kills_stats.csv, vct_2024\matches\kills_stats.csv, vct_2025\matches\kills_stats.csv, vct_2026\matches\kills_stats.csv |
| 1v3 | vct_2021\matches\kills_stats.csv, vct_2022\matches\kills_stats.csv, vct_2023\matches\kills_stats.csv, vct_2024\matches\kills_stats.csv, vct_2025\matches\kills_stats.csv, vct_2026\matches\kills_stats.csv |
| 1v4 | vct_2021\matches\kills_stats.csv, vct_2022\matches\kills_stats.csv, vct_2023\matches\kills_stats.csv, vct_2024\matches\kills_stats.csv, vct_2025\matches\kills_stats.csv, vct_2026\matches\kills_stats.csv |
| 1v5 | vct_2021\matches\kills_stats.csv, vct_2022\matches\kills_stats.csv, vct_2023\matches\kills_stats.csv, vct_2024\matches\kills_stats.csv, vct_2025\matches\kills_stats.csv, vct_2026\matches\kills_stats.csv |
| 2k | vct_2021\matches\kills_stats.csv, vct_2022\matches\kills_stats.csv, vct_2023\matches\kills_stats.csv, vct_2024\matches\kills_stats.csv, vct_2025\matches\kills_stats.csv, vct_2026\matches\kills_stats.csv |
| 3k | vct_2021\matches\kills_stats.csv, vct_2022\matches\kills_stats.csv, vct_2023\matches\kills_stats.csv, vct_2024\matches\kills_stats.csv, vct_2025\matches\kills_stats.csv, vct_2026\matches\kills_stats.csv |
| 4k | vct_2021\matches\kills_stats.csv, vct_2022\matches\kills_stats.csv, vct_2023\matches\kills_stats.csv, vct_2024\matches\kills_stats.csv, vct_2025\matches\kills_stats.csv, vct_2026\matches\kills_stats.csv |
| 5k | vct_2021\matches\kills_stats.csv, vct_2022\matches\kills_stats.csv, vct_2023\matches\kills_stats.csv, vct_2024\matches\kills_stats.csv, vct_2025\matches\kills_stats.csv, vct_2026\matches\kills_stats.csv |
| Abbreviated | all_ids\all_teams_mapping.csv, vct_2021\matches\team_mapping.csv, vct_2022\matches\team_mapping.csv, vct_2023\matches\team_mapping.csv, vct_2024\matches\team_mapping.csv, vct_2025\matches\team_mapping.csv, vct_2026\matches\team_mapping.csv |
| Action | vct_2021\matches\draft_phase.csv, vct_2022\matches\draft_phase.csv, vct_2023\matches\draft_phase.csv, vct_2024\matches\draft_phase.csv, vct_2025\matches\draft_phase.csv, vct_2026\matches\draft_phase.csv |
| Agent | vct_2021\agents\agents_pick_rates.csv, vct_2021\agents\teams_picked_agents.csv, vct_2022\agents\agents_pick_rates.csv, vct_2022\agents\teams_picked_agents.csv, vct_2023\agents\agents_pick_rates.csv, vct_2023\agents\teams_picked_agents.csv, vct_2024\agents\agents_pick_rates.csv, vct_2024\agents\teams_picked_agents.csv, vct_2025\agents\agents_pick_rates.csv, vct_2025\agents\teams_picked_agents.csv, vct_2026\agents\agents_pick_rates.csv, vct_2026\agents\teams_picked_agents.csv |
| Agents | vct_2021\matches\kills_stats.csv, vct_2021\matches\overview.csv, vct_2021\players_stats\players_stats.csv, vct_2022\matches\kills_stats.csv, vct_2022\matches\overview.csv, vct_2022\players_stats\players_stats.csv, vct_2023\matches\kills_stats.csv, vct_2023\matches\overview.csv, vct_2023\players_stats\players_stats.csv, vct_2024\matches\kills_stats.csv, vct_2024\matches\overview.csv, vct_2024\players_stats\players_stats.csv, vct_2025\matches\kills_stats.csv, vct_2025\matches\overview.csv, vct_2025\players_stats\players_stats.csv, vct_2026\matches\kills_stats.csv, vct_2026\matches\overview.csv, vct_2026\players_stats\players_stats.csv |
| Assists | vct_2021\matches\overview.csv, vct_2021\players_stats\players_stats.csv, vct_2022\matches\overview.csv, vct_2022\players_stats\players_stats.csv, vct_2023\matches\overview.csv, vct_2023\players_stats\players_stats.csv, vct_2024\matches\overview.csv, vct_2024\players_stats\players_stats.csv, vct_2025\matches\overview.csv, vct_2025\players_stats\players_stats.csv, vct_2026\matches\overview.csv, vct_2026\players_stats\players_stats.csv |
| Assists Per Round | vct_2021\players_stats\players_stats.csv, vct_2022\players_stats\players_stats.csv, vct_2023\players_stats\players_stats.csv, vct_2024\players_stats\players_stats.csv, vct_2025\players_stats\players_stats.csv, vct_2026\players_stats\players_stats.csv |
| Attacker Side Win Percentage | vct_2021\agents\maps_stats.csv, vct_2022\agents\maps_stats.csv, vct_2023\agents\maps_stats.csv, vct_2024\agents\maps_stats.csv, vct_2025\agents\maps_stats.csv, vct_2026\agents\maps_stats.csv |
| Average Combat Score | vct_2021\matches\overview.csv, vct_2021\players_stats\players_stats.csv, vct_2022\matches\overview.csv, vct_2022\players_stats\players_stats.csv, vct_2023\matches\overview.csv, vct_2023\players_stats\players_stats.csv, vct_2024\matches\overview.csv, vct_2024\players_stats\players_stats.csv, vct_2025\matches\overview.csv, vct_2025\players_stats\players_stats.csv, vct_2026\matches\overview.csv, vct_2026\players_stats\players_stats.csv |
| Average Damage Per Round | vct_2021\matches\overview.csv, vct_2021\players_stats\players_stats.csv, vct_2022\matches\overview.csv, vct_2022\players_stats\players_stats.csv, vct_2023\matches\overview.csv, vct_2023\players_stats\players_stats.csv, vct_2024\matches\overview.csv, vct_2024\players_stats\players_stats.csv, vct_2025\matches\overview.csv, vct_2025\players_stats\players_stats.csv, vct_2026\matches\overview.csv, vct_2026\players_stats\players_stats.csv |
| Clutch Success % | vct_2021\players_stats\players_stats.csv, vct_2022\players_stats\players_stats.csv, vct_2023\players_stats\players_stats.csv, vct_2024\players_stats\players_stats.csv, vct_2025\players_stats\players_stats.csv, vct_2026\players_stats\players_stats.csv |
| Clutches (won/played) | vct_2021\players_stats\players_stats.csv, vct_2022\players_stats\players_stats.csv, vct_2023\players_stats\players_stats.csv, vct_2024\players_stats\players_stats.csv, vct_2025\players_stats\players_stats.csv, vct_2026\players_stats\players_stats.csv |
| Deaths | vct_2021\matches\overview.csv, vct_2021\players_stats\players_stats.csv, vct_2022\matches\overview.csv, vct_2022\players_stats\players_stats.csv, vct_2023\matches\overview.csv, vct_2023\players_stats\players_stats.csv, vct_2024\matches\overview.csv, vct_2024\players_stats\players_stats.csv, vct_2025\matches\overview.csv, vct_2025\players_stats\players_stats.csv, vct_2026\matches\overview.csv, vct_2026\players_stats\players_stats.csv |
| Defender Side Win Percentage | vct_2021\agents\maps_stats.csv, vct_2022\agents\maps_stats.csv, vct_2023\agents\maps_stats.csv, vct_2024\agents\maps_stats.csv, vct_2025\agents\maps_stats.csv, vct_2026\agents\maps_stats.csv |
| Defused | vct_2021\matches\win_loss_methods_count.csv, vct_2022\matches\win_loss_methods_count.csv, vct_2023\matches\win_loss_methods_count.csv, vct_2024\matches\win_loss_methods_count.csv, vct_2025\matches\win_loss_methods_count.csv, vct_2026\matches\win_loss_methods_count.csv |
| Defused Failed | vct_2021\matches\win_loss_methods_count.csv, vct_2022\matches\win_loss_methods_count.csv, vct_2023\matches\win_loss_methods_count.csv, vct_2024\matches\win_loss_methods_count.csv, vct_2025\matches\win_loss_methods_count.csv, vct_2026\matches\win_loss_methods_count.csv |
| Detonated | vct_2021\matches\win_loss_methods_count.csv, vct_2022\matches\win_loss_methods_count.csv, vct_2023\matches\win_loss_methods_count.csv, vct_2024\matches\win_loss_methods_count.csv, vct_2025\matches\win_loss_methods_count.csv, vct_2026\matches\win_loss_methods_count.csv |
| Detonation Denied | vct_2021\matches\win_loss_methods_count.csv, vct_2022\matches\win_loss_methods_count.csv, vct_2023\matches\win_loss_methods_count.csv, vct_2024\matches\win_loss_methods_count.csv, vct_2025\matches\win_loss_methods_count.csv, vct_2026\matches\win_loss_methods_count.csv |
| Difference | vct_2021\matches\kills.csv, vct_2022\matches\kills.csv, vct_2023\matches\kills.csv, vct_2024\matches\kills.csv, vct_2025\matches\kills.csv, vct_2026\matches\kills.csv |
| Duration | vct_2021\matches\maps_scores.csv, vct_2022\matches\maps_scores.csv, vct_2023\matches\maps_scores.csv, vct_2024\matches\maps_scores.csv, vct_2025\matches\maps_scores.csv, vct_2026\matches\maps_scores.csv |
| Econ | vct_2021\matches\kills_stats.csv, vct_2022\matches\kills_stats.csv, vct_2023\matches\kills_stats.csv, vct_2024\matches\kills_stats.csv, vct_2025\matches\kills_stats.csv, vct_2026\matches\kills_stats.csv |
| Eliminated | vct_2021\matches\rounds_kills.csv, vct_2021\matches\win_loss_methods_count.csv, vct_2022\matches\rounds_kills.csv, vct_2022\matches\win_loss_methods_count.csv, vct_2023\matches\rounds_kills.csv, vct_2023\matches\win_loss_methods_count.csv, vct_2024\matches\rounds_kills.csv, vct_2024\matches\win_loss_methods_count.csv, vct_2025\matches\rounds_kills.csv, vct_2025\matches\win_loss_methods_count.csv, vct_2026\matches\rounds_kills.csv, vct_2026\matches\win_loss_methods_count.csv |
| Eliminated Agent | vct_2021\matches\rounds_kills.csv, vct_2022\matches\rounds_kills.csv, vct_2023\matches\rounds_kills.csv, vct_2024\matches\rounds_kills.csv, vct_2025\matches\rounds_kills.csv, vct_2026\matches\rounds_kills.csv |
| Eliminated Team | vct_2021\matches\rounds_kills.csv, vct_2022\matches\rounds_kills.csv, vct_2023\matches\rounds_kills.csv, vct_2024\matches\rounds_kills.csv, vct_2025\matches\rounds_kills.csv, vct_2026\matches\rounds_kills.csv |
| Elimination | vct_2021\matches\win_loss_methods_count.csv, vct_2022\matches\win_loss_methods_count.csv, vct_2023\matches\win_loss_methods_count.csv, vct_2024\matches\win_loss_methods_count.csv, vct_2025\matches\win_loss_methods_count.csv, vct_2026\matches\win_loss_methods_count.csv |
| Eliminator | vct_2021\matches\rounds_kills.csv, vct_2022\matches\rounds_kills.csv, vct_2023\matches\rounds_kills.csv, vct_2024\matches\rounds_kills.csv, vct_2025\matches\rounds_kills.csv, vct_2026\matches\rounds_kills.csv |
| Eliminator Agent | vct_2021\matches\rounds_kills.csv, vct_2022\matches\rounds_kills.csv, vct_2023\matches\rounds_kills.csv, vct_2024\matches\rounds_kills.csv, vct_2025\matches\rounds_kills.csv, vct_2026\matches\rounds_kills.csv |
| Eliminator Team | vct_2021\matches\rounds_kills.csv, vct_2022\matches\rounds_kills.csv, vct_2023\matches\rounds_kills.csv, vct_2024\matches\rounds_kills.csv, vct_2025\matches\rounds_kills.csv, vct_2026\matches\rounds_kills.csv |
| Enemy | vct_2021\matches\kills.csv, vct_2022\matches\kills.csv, vct_2023\matches\kills.csv, vct_2024\matches\kills.csv, vct_2025\matches\kills.csv, vct_2026\matches\kills.csv |
| Enemy Kills | vct_2021\matches\kills.csv, vct_2022\matches\kills.csv, vct_2023\matches\kills.csv, vct_2024\matches\kills.csv, vct_2025\matches\kills.csv, vct_2026\matches\kills.csv |
| Enemy Team | vct_2021\matches\kills.csv, vct_2022\matches\kills.csv, vct_2023\matches\kills.csv, vct_2024\matches\kills.csv, vct_2025\matches\kills.csv, vct_2026\matches\kills.csv |
| First Deaths | vct_2021\matches\overview.csv, vct_2021\players_stats\players_stats.csv, vct_2022\matches\overview.csv, vct_2022\players_stats\players_stats.csv, vct_2023\matches\overview.csv, vct_2023\players_stats\players_stats.csv, vct_2024\matches\overview.csv, vct_2024\players_stats\players_stats.csv, vct_2025\matches\overview.csv, vct_2025\players_stats\players_stats.csv, vct_2026\matches\overview.csv, vct_2026\players_stats\players_stats.csv |
| First Deaths Per Round | vct_2021\players_stats\players_stats.csv, vct_2022\players_stats\players_stats.csv, vct_2023\players_stats\players_stats.csv, vct_2024\players_stats\players_stats.csv, vct_2025\players_stats\players_stats.csv, vct_2026\players_stats\players_stats.csv |
| First Kills | vct_2021\matches\overview.csv, vct_2021\players_stats\players_stats.csv, vct_2022\matches\overview.csv, vct_2022\players_stats\players_stats.csv, vct_2023\matches\overview.csv, vct_2023\players_stats\players_stats.csv, vct_2024\matches\overview.csv, vct_2024\players_stats\players_stats.csv, vct_2025\matches\overview.csv, vct_2025\players_stats\players_stats.csv, vct_2026\matches\overview.csv, vct_2026\players_stats\players_stats.csv |
| First Kills Per Round | vct_2021\players_stats\players_stats.csv, vct_2022\players_stats\players_stats.csv, vct_2023\players_stats\players_stats.csv, vct_2024\players_stats\players_stats.csv, vct_2025\players_stats\players_stats.csv, vct_2026\players_stats\players_stats.csv |
| Full Name | all_ids\all_teams_mapping.csv, vct_2021\matches\team_mapping.csv, vct_2022\matches\team_mapping.csv, vct_2023\matches\team_mapping.csv, vct_2024\matches\team_mapping.csv, vct_2025\matches\team_mapping.csv, vct_2026\matches\team_mapping.csv |
| Game ID | all_ids\all_matches_games_ids.csv, vct_2021\ids\tournaments_stages_matches_games_ids.csv, vct_2022\ids\tournaments_stages_matches_games_ids.csv, vct_2023\ids\tournaments_stages_matches_games_ids.csv, vct_2024\ids\tournaments_stages_matches_games_ids.csv, vct_2025\ids\tournaments_stages_matches_games_ids.csv, vct_2026\ids\tournaments_stages_matches_games_ids.csv |
| Headshot % | vct_2021\matches\overview.csv, vct_2021\players_stats\players_stats.csv, vct_2022\matches\overview.csv, vct_2022\players_stats\players_stats.csv, vct_2023\matches\overview.csv, vct_2023\players_stats\players_stats.csv, vct_2024\matches\overview.csv, vct_2024\players_stats\players_stats.csv, vct_2025\matches\overview.csv, vct_2025\players_stats\players_stats.csv, vct_2026\matches\overview.csv, vct_2026\players_stats\players_stats.csv |
| Initiated | vct_2021\matches\eco_stats.csv, vct_2022\matches\eco_stats.csv, vct_2023\matches\eco_stats.csv, vct_2024\matches\eco_stats.csv, vct_2025\matches\eco_stats.csv, vct_2026\matches\eco_stats.csv |
| Kill Type | vct_2021\matches\kills.csv, vct_2021\matches\rounds_kills.csv, vct_2022\matches\kills.csv, vct_2022\matches\rounds_kills.csv, vct_2023\matches\kills.csv, vct_2023\matches\rounds_kills.csv, vct_2024\matches\kills.csv, vct_2024\matches\rounds_kills.csv, vct_2025\matches\kills.csv, vct_2025\matches\rounds_kills.csv, vct_2026\matches\kills.csv, vct_2026\matches\rounds_kills.csv |
| Kill, Assist, Trade, Survive % | vct_2021\matches\overview.csv, vct_2021\players_stats\players_stats.csv, vct_2022\matches\overview.csv, vct_2022\players_stats\players_stats.csv, vct_2023\matches\overview.csv, vct_2023\players_stats\players_stats.csv, vct_2024\matches\overview.csv, vct_2024\players_stats\players_stats.csv, vct_2025\matches\overview.csv, vct_2025\players_stats\players_stats.csv, vct_2026\matches\overview.csv, vct_2026\players_stats\players_stats.csv |
| Kills | vct_2021\matches\overview.csv, vct_2021\players_stats\players_stats.csv, vct_2022\matches\overview.csv, vct_2022\players_stats\players_stats.csv, vct_2023\matches\overview.csv, vct_2023\players_stats\players_stats.csv, vct_2024\matches\overview.csv, vct_2024\players_stats\players_stats.csv, vct_2025\matches\overview.csv, vct_2025\players_stats\players_stats.csv, vct_2026\matches\overview.csv, vct_2026\players_stats\players_stats.csv |
| Kills - Deaths (FKD) | vct_2021\matches\overview.csv, vct_2022\matches\overview.csv, vct_2023\matches\overview.csv, vct_2024\matches\overview.csv, vct_2025\matches\overview.csv, vct_2026\matches\overview.csv |
| Kills - Deaths (KD) | vct_2021\matches\overview.csv, vct_2022\matches\overview.csv, vct_2023\matches\overview.csv, vct_2024\matches\overview.csv, vct_2025\matches\overview.csv, vct_2026\matches\overview.csv |
| Kills Per Round | vct_2021\players_stats\players_stats.csv, vct_2022\players_stats\players_stats.csv, vct_2023\players_stats\players_stats.csv, vct_2024\players_stats\players_stats.csv, vct_2025\players_stats\players_stats.csv, vct_2026\players_stats\players_stats.csv |
| Kills:Deaths | vct_2021\players_stats\players_stats.csv, vct_2022\players_stats\players_stats.csv, vct_2023\players_stats\players_stats.csv, vct_2024\players_stats\players_stats.csv, vct_2025\players_stats\players_stats.csv, vct_2026\players_stats\players_stats.csv |
| Loadout Value | vct_2021\matches\eco_rounds.csv, vct_2022\matches\eco_rounds.csv, vct_2023\matches\eco_rounds.csv, vct_2024\matches\eco_rounds.csv, vct_2025\matches\eco_rounds.csv, vct_2026\matches\eco_rounds.csv |
| Map | all_ids\all_matches_games_ids.csv, vct_2021\agents\agents_pick_rates.csv, vct_2021\agents\maps_stats.csv, vct_2021\agents\teams_picked_agents.csv, vct_2021\ids\tournaments_stages_matches_games_ids.csv, vct_2021\matches\draft_phase.csv, vct_2021\matches\eco_rounds.csv, vct_2021\matches\eco_stats.csv, vct_2021\matches\kills.csv, vct_2021\matches\kills_stats.csv, vct_2021\matches\maps_played.csv, vct_2021\matches\maps_scores.csv, vct_2021\matches\overview.csv, vct_2021\matches\rounds_kills.csv, vct_2021\matches\win_loss_methods_count.csv, vct_2021\matches\win_loss_methods_round_number.csv, vct_2022\agents\agents_pick_rates.csv, vct_2022\agents\maps_stats.csv, vct_2022\agents\teams_picked_agents.csv, vct_2022\ids\tournaments_stages_matches_games_ids.csv, vct_2022\matches\draft_phase.csv, vct_2022\matches\eco_rounds.csv, vct_2022\matches\eco_stats.csv, vct_2022\matches\kills.csv, vct_2022\matches\kills_stats.csv, vct_2022\matches\maps_played.csv, vct_2022\matches\maps_scores.csv, vct_2022\matches\overview.csv, vct_2022\matches\rounds_kills.csv, vct_2022\matches\win_loss_methods_count.csv, vct_2022\matches\win_loss_methods_round_number.csv, vct_2023\agents\agents_pick_rates.csv, vct_2023\agents\maps_stats.csv, vct_2023\agents\teams_picked_agents.csv, vct_2023\ids\tournaments_stages_matches_games_ids.csv, vct_2023\matches\draft_phase.csv, vct_2023\matches\eco_rounds.csv, vct_2023\matches\eco_stats.csv, vct_2023\matches\kills.csv, vct_2023\matches\kills_stats.csv, vct_2023\matches\maps_played.csv, vct_2023\matches\maps_scores.csv, vct_2023\matches\overview.csv, vct_2023\matches\rounds_kills.csv, vct_2023\matches\win_loss_methods_count.csv, vct_2023\matches\win_loss_methods_round_number.csv, vct_2024\agents\agents_pick_rates.csv, vct_2024\agents\maps_stats.csv, vct_2024\agents\teams_picked_agents.csv, vct_2024\ids\tournaments_stages_matches_games_ids.csv, vct_2024\matches\draft_phase.csv, vct_2024\matches\eco_rounds.csv, vct_2024\matches\eco_stats.csv, vct_2024\matches\kills.csv, vct_2024\matches\kills_stats.csv, vct_2024\matches\maps_played.csv, vct_2024\matches\maps_scores.csv, vct_2024\matches\overview.csv, vct_2024\matches\rounds_kills.csv, vct_2024\matches\win_loss_methods_count.csv, vct_2024\matches\win_loss_methods_round_number.csv, vct_2025\agents\agents_pick_rates.csv, vct_2025\agents\maps_stats.csv, vct_2025\agents\teams_picked_agents.csv, vct_2025\ids\tournaments_stages_matches_games_ids.csv, vct_2025\matches\draft_phase.csv, vct_2025\matches\eco_rounds.csv, vct_2025\matches\eco_stats.csv, vct_2025\matches\kills.csv, vct_2025\matches\kills_stats.csv, vct_2025\matches\maps_played.csv, vct_2025\matches\maps_scores.csv, vct_2025\matches\overview.csv, vct_2025\matches\rounds_kills.csv, vct_2025\matches\win_loss_methods_count.csv, vct_2025\matches\win_loss_methods_round_number.csv, vct_2026\agents\agents_pick_rates.csv, vct_2026\agents\maps_stats.csv, vct_2026\agents\teams_picked_agents.csv, vct_2026\ids\tournaments_stages_matches_games_ids.csv, vct_2026\matches\draft_phase.csv, vct_2026\matches\eco_rounds.csv, vct_2026\matches\eco_stats.csv, vct_2026\matches\kills.csv, vct_2026\matches\kills_stats.csv, vct_2026\matches\maps_played.csv, vct_2026\matches\maps_scores.csv, vct_2026\matches\overview.csv, vct_2026\matches\rounds_kills.csv, vct_2026\matches\win_loss_methods_count.csv, vct_2026\matches\win_loss_methods_round_number.csv |
| Match ID | all_ids\all_matches_games_ids.csv, vct_2021\ids\tournaments_stages_matches_games_ids.csv, vct_2022\ids\tournaments_stages_matches_games_ids.csv, vct_2023\ids\tournaments_stages_matches_games_ids.csv, vct_2024\ids\tournaments_stages_matches_games_ids.csv, vct_2025\ids\tournaments_stages_matches_games_ids.csv, vct_2026\ids\tournaments_stages_matches_games_ids.csv |
| Match Name | all_ids\all_matches_games_ids.csv, vct_2021\ids\tournaments_stages_matches_games_ids.csv, vct_2021\matches\draft_phase.csv, vct_2021\matches\eco_rounds.csv, vct_2021\matches\eco_stats.csv, vct_2021\matches\kills.csv, vct_2021\matches\kills_stats.csv, vct_2021\matches\maps_played.csv, vct_2021\matches\maps_scores.csv, vct_2021\matches\overview.csv, vct_2021\matches\rounds_kills.csv, vct_2021\matches\scores.csv, vct_2021\matches\win_loss_methods_count.csv, vct_2021\matches\win_loss_methods_round_number.csv, vct_2022\ids\tournaments_stages_matches_games_ids.csv, vct_2022\matches\draft_phase.csv, vct_2022\matches\eco_rounds.csv, vct_2022\matches\eco_stats.csv, vct_2022\matches\kills.csv, vct_2022\matches\kills_stats.csv, vct_2022\matches\maps_played.csv, vct_2022\matches\maps_scores.csv, vct_2022\matches\overview.csv, vct_2022\matches\rounds_kills.csv, vct_2022\matches\scores.csv, vct_2022\matches\win_loss_methods_count.csv, vct_2022\matches\win_loss_methods_round_number.csv, vct_2023\ids\tournaments_stages_matches_games_ids.csv, vct_2023\matches\draft_phase.csv, vct_2023\matches\eco_rounds.csv, vct_2023\matches\eco_stats.csv, vct_2023\matches\kills.csv, vct_2023\matches\kills_stats.csv, vct_2023\matches\maps_played.csv, vct_2023\matches\maps_scores.csv, vct_2023\matches\overview.csv, vct_2023\matches\rounds_kills.csv, vct_2023\matches\scores.csv, vct_2023\matches\win_loss_methods_count.csv, vct_2023\matches\win_loss_methods_round_number.csv, vct_2024\ids\tournaments_stages_matches_games_ids.csv, vct_2024\matches\draft_phase.csv, vct_2024\matches\eco_rounds.csv, vct_2024\matches\eco_stats.csv, vct_2024\matches\kills.csv, vct_2024\matches\kills_stats.csv, vct_2024\matches\maps_played.csv, vct_2024\matches\maps_scores.csv, vct_2024\matches\overview.csv, vct_2024\matches\rounds_kills.csv, vct_2024\matches\scores.csv, vct_2024\matches\win_loss_methods_count.csv, vct_2024\matches\win_loss_methods_round_number.csv, vct_2025\ids\tournaments_stages_matches_games_ids.csv, vct_2025\matches\draft_phase.csv, vct_2025\matches\eco_rounds.csv, vct_2025\matches\eco_stats.csv, vct_2025\matches\kills.csv, vct_2025\matches\kills_stats.csv, vct_2025\matches\maps_played.csv, vct_2025\matches\maps_scores.csv, vct_2025\matches\overview.csv, vct_2025\matches\rounds_kills.csv, vct_2025\matches\scores.csv, vct_2025\matches\win_loss_methods_count.csv, vct_2025\matches\win_loss_methods_round_number.csv, vct_2026\ids\tournaments_stages_matches_games_ids.csv, vct_2026\matches\draft_phase.csv, vct_2026\matches\eco_rounds.csv, vct_2026\matches\eco_stats.csv, vct_2026\matches\kills.csv, vct_2026\matches\kills_stats.csv, vct_2026\matches\maps_played.csv, vct_2026\matches\maps_scores.csv, vct_2026\matches\overview.csv, vct_2026\matches\rounds_kills.csv, vct_2026\matches\scores.csv, vct_2026\matches\win_loss_methods_count.csv, vct_2026\matches\win_loss_methods_round_number.csv |
| Match Result | vct_2021\matches\scores.csv, vct_2022\matches\scores.csv, vct_2023\matches\scores.csv, vct_2024\matches\scores.csv, vct_2025\matches\scores.csv, vct_2026\matches\scores.csv |
| Match Type | all_ids\all_matches_games_ids.csv, all_ids\all_tournaments_stages_match_types_ids.csv, vct_2021\agents\agents_pick_rates.csv, vct_2021\agents\maps_stats.csv, vct_2021\agents\teams_picked_agents.csv, vct_2021\ids\tournaments_stages_match_types_ids.csv, vct_2021\ids\tournaments_stages_matches_games_ids.csv, vct_2021\matches\draft_phase.csv, vct_2021\matches\eco_rounds.csv, vct_2021\matches\eco_stats.csv, vct_2021\matches\kills.csv, vct_2021\matches\kills_stats.csv, vct_2021\matches\maps_played.csv, vct_2021\matches\maps_scores.csv, vct_2021\matches\overview.csv, vct_2021\matches\rounds_kills.csv, vct_2021\matches\scores.csv, vct_2021\matches\win_loss_methods_count.csv, vct_2021\matches\win_loss_methods_round_number.csv, vct_2021\players_stats\players_stats.csv, vct_2022\agents\agents_pick_rates.csv, vct_2022\agents\maps_stats.csv, vct_2022\agents\teams_picked_agents.csv, vct_2022\ids\tournaments_stages_match_types_ids.csv, vct_2022\ids\tournaments_stages_matches_games_ids.csv, vct_2022\matches\draft_phase.csv, vct_2022\matches\eco_rounds.csv, vct_2022\matches\eco_stats.csv, vct_2022\matches\kills.csv, vct_2022\matches\kills_stats.csv, vct_2022\matches\maps_played.csv, vct_2022\matches\maps_scores.csv, vct_2022\matches\overview.csv, vct_2022\matches\rounds_kills.csv, vct_2022\matches\scores.csv, vct_2022\matches\win_loss_methods_count.csv, vct_2022\matches\win_loss_methods_round_number.csv, vct_2022\players_stats\players_stats.csv, vct_2023\agents\agents_pick_rates.csv, vct_2023\agents\maps_stats.csv, vct_2023\agents\teams_picked_agents.csv, vct_2023\ids\tournaments_stages_match_types_ids.csv, vct_2023\ids\tournaments_stages_matches_games_ids.csv, vct_2023\matches\draft_phase.csv, vct_2023\matches\eco_rounds.csv, vct_2023\matches\eco_stats.csv, vct_2023\matches\kills.csv, vct_2023\matches\kills_stats.csv, vct_2023\matches\maps_played.csv, vct_2023\matches\maps_scores.csv, vct_2023\matches\overview.csv, vct_2023\matches\rounds_kills.csv, vct_2023\matches\scores.csv, vct_2023\matches\win_loss_methods_count.csv, vct_2023\matches\win_loss_methods_round_number.csv, vct_2023\players_stats\players_stats.csv, vct_2024\agents\agents_pick_rates.csv, vct_2024\agents\maps_stats.csv, vct_2024\agents\teams_picked_agents.csv, vct_2024\ids\tournaments_stages_match_types_ids.csv, vct_2024\ids\tournaments_stages_matches_games_ids.csv, vct_2024\matches\draft_phase.csv, vct_2024\matches\eco_rounds.csv, vct_2024\matches\eco_stats.csv, vct_2024\matches\kills.csv, vct_2024\matches\kills_stats.csv, vct_2024\matches\maps_played.csv, vct_2024\matches\maps_scores.csv, vct_2024\matches\overview.csv, vct_2024\matches\rounds_kills.csv, vct_2024\matches\scores.csv, vct_2024\matches\win_loss_methods_count.csv, vct_2024\matches\win_loss_methods_round_number.csv, vct_2024\players_stats\players_stats.csv, vct_2025\agents\agents_pick_rates.csv, vct_2025\agents\maps_stats.csv, vct_2025\agents\teams_picked_agents.csv, vct_2025\ids\tournaments_stages_match_types_ids.csv, vct_2025\ids\tournaments_stages_matches_games_ids.csv, vct_2025\matches\draft_phase.csv, vct_2025\matches\eco_rounds.csv, vct_2025\matches\eco_stats.csv, vct_2025\matches\kills.csv, vct_2025\matches\kills_stats.csv, vct_2025\matches\maps_played.csv, vct_2025\matches\maps_scores.csv, vct_2025\matches\overview.csv, vct_2025\matches\rounds_kills.csv, vct_2025\matches\scores.csv, vct_2025\matches\win_loss_methods_count.csv, vct_2025\matches\win_loss_methods_round_number.csv, vct_2025\players_stats\players_stats.csv, vct_2026\agents\agents_pick_rates.csv, vct_2026\agents\maps_stats.csv, vct_2026\agents\teams_picked_agents.csv, vct_2026\ids\tournaments_stages_match_types_ids.csv, vct_2026\ids\tournaments_stages_matches_games_ids.csv, vct_2026\matches\draft_phase.csv, vct_2026\matches\eco_rounds.csv, vct_2026\matches\eco_stats.csv, vct_2026\matches\kills.csv, vct_2026\matches\kills_stats.csv, vct_2026\matches\maps_played.csv, vct_2026\matches\maps_scores.csv, vct_2026\matches\overview.csv, vct_2026\matches\rounds_kills.csv, vct_2026\matches\scores.csv, vct_2026\matches\win_loss_methods_count.csv, vct_2026\matches\win_loss_methods_round_number.csv, vct_2026\players_stats\players_stats.csv |
| Match Type ID | all_ids\all_matches_games_ids.csv, all_ids\all_tournaments_stages_match_types_ids.csv, vct_2021\ids\tournaments_stages_match_types_ids.csv, vct_2022\ids\tournaments_stages_match_types_ids.csv, vct_2023\ids\tournaments_stages_match_types_ids.csv, vct_2024\ids\tournaments_stages_match_types_ids.csv, vct_2025\ids\tournaments_stages_match_types_ids.csv, vct_2026\ids\tournaments_stages_match_types_ids.csv |
| Maximum Kills in a Single Map | vct_2021\players_stats\players_stats.csv, vct_2022\players_stats\players_stats.csv, vct_2023\players_stats\players_stats.csv, vct_2024\players_stats\players_stats.csv, vct_2025\players_stats\players_stats.csv, vct_2026\players_stats\players_stats.csv |
| Method | vct_2021\matches\win_loss_methods_round_number.csv, vct_2022\matches\win_loss_methods_round_number.csv, vct_2023\matches\win_loss_methods_round_number.csv, vct_2024\matches\win_loss_methods_round_number.csv, vct_2025\matches\win_loss_methods_round_number.csv, vct_2026\matches\win_loss_methods_round_number.csv |
| Outcome | vct_2021\matches\eco_rounds.csv, vct_2021\matches\win_loss_methods_round_number.csv, vct_2022\matches\eco_rounds.csv, vct_2022\matches\win_loss_methods_round_number.csv, vct_2023\matches\eco_rounds.csv, vct_2023\matches\win_loss_methods_round_number.csv, vct_2024\matches\eco_rounds.csv, vct_2024\matches\win_loss_methods_round_number.csv, vct_2025\matches\eco_rounds.csv, vct_2025\matches\win_loss_methods_round_number.csv, vct_2026\matches\eco_rounds.csv, vct_2026\matches\win_loss_methods_round_number.csv |
| Pick Rate | vct_2021\agents\agents_pick_rates.csv, vct_2022\agents\agents_pick_rates.csv, vct_2023\agents\agents_pick_rates.csv, vct_2024\agents\agents_pick_rates.csv, vct_2025\agents\agents_pick_rates.csv, vct_2026\agents\agents_pick_rates.csv |
| Player | all_ids\all_players_ids.csv, vct_2021\ids\players_ids.csv, vct_2021\matches\kills.csv, vct_2021\matches\kills_stats.csv, vct_2021\matches\overview.csv, vct_2021\players_stats\players_stats.csv, vct_2022\ids\players_ids.csv, vct_2022\matches\kills.csv, vct_2022\matches\kills_stats.csv, vct_2022\matches\overview.csv, vct_2022\players_stats\players_stats.csv, vct_2023\ids\players_ids.csv, vct_2023\matches\kills.csv, vct_2023\matches\kills_stats.csv, vct_2023\matches\overview.csv, vct_2023\players_stats\players_stats.csv, vct_2024\ids\players_ids.csv, vct_2024\matches\kills.csv, vct_2024\matches\kills_stats.csv, vct_2024\matches\overview.csv, vct_2024\players_stats\players_stats.csv, vct_2025\ids\players_ids.csv, vct_2025\matches\kills.csv, vct_2025\matches\kills_stats.csv, vct_2025\matches\overview.csv, vct_2025\players_stats\players_stats.csv, vct_2026\ids\players_ids.csv, vct_2026\matches\kills.csv, vct_2026\matches\kills_stats.csv, vct_2026\matches\overview.csv, vct_2026\players_stats\players_stats.csv |
| Player ID | all_ids\all_players_ids.csv, vct_2021\ids\players_ids.csv, vct_2022\ids\players_ids.csv, vct_2023\ids\players_ids.csv, vct_2024\ids\players_ids.csv, vct_2025\ids\players_ids.csv, vct_2026\ids\players_ids.csv |
| Player Kills | vct_2021\matches\kills.csv, vct_2022\matches\kills.csv, vct_2023\matches\kills.csv, vct_2024\matches\kills.csv, vct_2025\matches\kills.csv, vct_2026\matches\kills.csv |
| Player Team | vct_2021\matches\kills.csv, vct_2022\matches\kills.csv, vct_2023\matches\kills.csv, vct_2024\matches\kills.csv, vct_2025\matches\kills.csv, vct_2026\matches\kills.csv |
| Rating | vct_2021\matches\overview.csv, vct_2021\players_stats\players_stats.csv, vct_2022\matches\overview.csv, vct_2022\players_stats\players_stats.csv, vct_2023\matches\overview.csv, vct_2023\players_stats\players_stats.csv, vct_2024\matches\overview.csv, vct_2024\players_stats\players_stats.csv, vct_2025\matches\overview.csv, vct_2025\players_stats\players_stats.csv, vct_2026\matches\overview.csv, vct_2026\players_stats\players_stats.csv |
| Remaining Credits | vct_2021\matches\eco_rounds.csv, vct_2022\matches\eco_rounds.csv, vct_2023\matches\eco_rounds.csv, vct_2024\matches\eco_rounds.csv, vct_2025\matches\eco_rounds.csv, vct_2026\matches\eco_rounds.csv |
| Round Number | vct_2021\matches\eco_rounds.csv, vct_2021\matches\rounds_kills.csv, vct_2021\matches\win_loss_methods_round_number.csv, vct_2022\matches\eco_rounds.csv, vct_2022\matches\rounds_kills.csv, vct_2022\matches\win_loss_methods_round_number.csv, vct_2023\matches\eco_rounds.csv, vct_2023\matches\rounds_kills.csv, vct_2023\matches\win_loss_methods_round_number.csv, vct_2024\matches\eco_rounds.csv, vct_2024\matches\rounds_kills.csv, vct_2024\matches\win_loss_methods_round_number.csv, vct_2025\matches\eco_rounds.csv, vct_2025\matches\rounds_kills.csv, vct_2025\matches\win_loss_methods_round_number.csv, vct_2026\matches\eco_rounds.csv, vct_2026\matches\rounds_kills.csv, vct_2026\matches\win_loss_methods_round_number.csv |
| Rounds Played | vct_2021\players_stats\players_stats.csv, vct_2022\players_stats\players_stats.csv, vct_2023\players_stats\players_stats.csv, vct_2024\players_stats\players_stats.csv, vct_2025\players_stats\players_stats.csv, vct_2026\players_stats\players_stats.csv |
| Side | vct_2021\matches\overview.csv, vct_2022\matches\overview.csv, vct_2023\matches\overview.csv, vct_2024\matches\overview.csv, vct_2025\matches\overview.csv, vct_2026\matches\overview.csv |
| Spike Defuses | vct_2021\matches\kills_stats.csv, vct_2022\matches\kills_stats.csv, vct_2023\matches\kills_stats.csv, vct_2024\matches\kills_stats.csv, vct_2025\matches\kills_stats.csv, vct_2026\matches\kills_stats.csv |
| Spike Plants | vct_2021\matches\kills_stats.csv, vct_2022\matches\kills_stats.csv, vct_2023\matches\kills_stats.csv, vct_2024\matches\kills_stats.csv, vct_2025\matches\kills_stats.csv, vct_2026\matches\kills_stats.csv |
| Stage | all_ids\all_matches_games_ids.csv, all_ids\all_tournaments_stages_match_types_ids.csv, vct_2021\agents\agents_pick_rates.csv, vct_2021\agents\maps_stats.csv, vct_2021\agents\teams_picked_agents.csv, vct_2021\ids\tournaments_stages_match_types_ids.csv, vct_2021\ids\tournaments_stages_matches_games_ids.csv, vct_2021\matches\draft_phase.csv, vct_2021\matches\eco_rounds.csv, vct_2021\matches\eco_stats.csv, vct_2021\matches\kills.csv, vct_2021\matches\kills_stats.csv, vct_2021\matches\maps_played.csv, vct_2021\matches\maps_scores.csv, vct_2021\matches\overview.csv, vct_2021\matches\rounds_kills.csv, vct_2021\matches\scores.csv, vct_2021\matches\win_loss_methods_count.csv, vct_2021\matches\win_loss_methods_round_number.csv, vct_2021\players_stats\players_stats.csv, vct_2022\agents\agents_pick_rates.csv, vct_2022\agents\maps_stats.csv, vct_2022\agents\teams_picked_agents.csv, vct_2022\ids\tournaments_stages_match_types_ids.csv, vct_2022\ids\tournaments_stages_matches_games_ids.csv, vct_2022\matches\draft_phase.csv, vct_2022\matches\eco_rounds.csv, vct_2022\matches\eco_stats.csv, vct_2022\matches\kills.csv, vct_2022\matches\kills_stats.csv, vct_2022\matches\maps_played.csv, vct_2022\matches\maps_scores.csv, vct_2022\matches\overview.csv, vct_2022\matches\rounds_kills.csv, vct_2022\matches\scores.csv, vct_2022\matches\win_loss_methods_count.csv, vct_2022\matches\win_loss_methods_round_number.csv, vct_2022\players_stats\players_stats.csv, vct_2023\agents\agents_pick_rates.csv, vct_2023\agents\maps_stats.csv, vct_2023\agents\teams_picked_agents.csv, vct_2023\ids\tournaments_stages_match_types_ids.csv, vct_2023\ids\tournaments_stages_matches_games_ids.csv, vct_2023\matches\draft_phase.csv, vct_2023\matches\eco_rounds.csv, vct_2023\matches\eco_stats.csv, vct_2023\matches\kills.csv, vct_2023\matches\kills_stats.csv, vct_2023\matches\maps_played.csv, vct_2023\matches\maps_scores.csv, vct_2023\matches\overview.csv, vct_2023\matches\rounds_kills.csv, vct_2023\matches\scores.csv, vct_2023\matches\win_loss_methods_count.csv, vct_2023\matches\win_loss_methods_round_number.csv, vct_2023\players_stats\players_stats.csv, vct_2024\agents\agents_pick_rates.csv, vct_2024\agents\maps_stats.csv, vct_2024\agents\teams_picked_agents.csv, vct_2024\ids\tournaments_stages_match_types_ids.csv, vct_2024\ids\tournaments_stages_matches_games_ids.csv, vct_2024\matches\draft_phase.csv, vct_2024\matches\eco_rounds.csv, vct_2024\matches\eco_stats.csv, vct_2024\matches\kills.csv, vct_2024\matches\kills_stats.csv, vct_2024\matches\maps_played.csv, vct_2024\matches\maps_scores.csv, vct_2024\matches\overview.csv, vct_2024\matches\rounds_kills.csv, vct_2024\matches\scores.csv, vct_2024\matches\win_loss_methods_count.csv, vct_2024\matches\win_loss_methods_round_number.csv, vct_2024\players_stats\players_stats.csv, vct_2025\agents\agents_pick_rates.csv, vct_2025\agents\maps_stats.csv, vct_2025\agents\teams_picked_agents.csv, vct_2025\ids\tournaments_stages_match_types_ids.csv, vct_2025\ids\tournaments_stages_matches_games_ids.csv, vct_2025\matches\draft_phase.csv, vct_2025\matches\eco_rounds.csv, vct_2025\matches\eco_stats.csv, vct_2025\matches\kills.csv, vct_2025\matches\kills_stats.csv, vct_2025\matches\maps_played.csv, vct_2025\matches\maps_scores.csv, vct_2025\matches\overview.csv, vct_2025\matches\rounds_kills.csv, vct_2025\matches\scores.csv, vct_2025\matches\win_loss_methods_count.csv, vct_2025\matches\win_loss_methods_round_number.csv, vct_2025\players_stats\players_stats.csv, vct_2026\agents\agents_pick_rates.csv, vct_2026\agents\maps_stats.csv, vct_2026\agents\teams_picked_agents.csv, vct_2026\ids\tournaments_stages_match_types_ids.csv, vct_2026\ids\tournaments_stages_matches_games_ids.csv, vct_2026\matches\draft_phase.csv, vct_2026\matches\eco_rounds.csv, vct_2026\matches\eco_stats.csv, vct_2026\matches\kills.csv, vct_2026\matches\kills_stats.csv, vct_2026\matches\maps_played.csv, vct_2026\matches\maps_scores.csv, vct_2026\matches\overview.csv, vct_2026\matches\rounds_kills.csv, vct_2026\matches\scores.csv, vct_2026\matches\win_loss_methods_count.csv, vct_2026\matches\win_loss_methods_round_number.csv, vct_2026\players_stats\players_stats.csv |
| Stage ID | all_ids\all_matches_games_ids.csv, all_ids\all_tournaments_stages_match_types_ids.csv, vct_2021\ids\tournaments_stages_match_types_ids.csv, vct_2021\ids\tournaments_stages_matches_games_ids.csv, vct_2022\ids\tournaments_stages_match_types_ids.csv, vct_2022\ids\tournaments_stages_matches_games_ids.csv, vct_2023\ids\tournaments_stages_match_types_ids.csv, vct_2023\ids\tournaments_stages_matches_games_ids.csv, vct_2024\ids\tournaments_stages_match_types_ids.csv, vct_2024\ids\tournaments_stages_matches_games_ids.csv, vct_2025\ids\tournaments_stages_match_types_ids.csv, vct_2025\ids\tournaments_stages_matches_games_ids.csv, vct_2026\ids\tournaments_stages_match_types_ids.csv, vct_2026\ids\tournaments_stages_matches_games_ids.csv |
| Team | all_ids\all_teams_ids.csv, vct_2021\agents\teams_picked_agents.csv, vct_2021\ids\teams_ids.csv, vct_2021\matches\draft_phase.csv, vct_2021\matches\eco_rounds.csv, vct_2021\matches\eco_stats.csv, vct_2021\matches\kills_stats.csv, vct_2021\matches\overview.csv, vct_2021\matches\win_loss_methods_count.csv, vct_2021\matches\win_loss_methods_round_number.csv, vct_2022\agents\teams_picked_agents.csv, vct_2022\ids\teams_ids.csv, vct_2022\matches\draft_phase.csv, vct_2022\matches\eco_rounds.csv, vct_2022\matches\eco_stats.csv, vct_2022\matches\kills_stats.csv, vct_2022\matches\overview.csv, vct_2022\matches\win_loss_methods_count.csv, vct_2022\matches\win_loss_methods_round_number.csv, vct_2023\agents\teams_picked_agents.csv, vct_2023\ids\teams_ids.csv, vct_2023\matches\draft_phase.csv, vct_2023\matches\eco_rounds.csv, vct_2023\matches\eco_stats.csv, vct_2023\matches\kills_stats.csv, vct_2023\matches\overview.csv, vct_2023\matches\win_loss_methods_count.csv, vct_2023\matches\win_loss_methods_round_number.csv, vct_2024\agents\teams_picked_agents.csv, vct_2024\ids\teams_ids.csv, vct_2024\matches\draft_phase.csv, vct_2024\matches\eco_rounds.csv, vct_2024\matches\eco_stats.csv, vct_2024\matches\kills_stats.csv, vct_2024\matches\overview.csv, vct_2024\matches\win_loss_methods_count.csv, vct_2024\matches\win_loss_methods_round_number.csv, vct_2025\agents\teams_picked_agents.csv, vct_2025\ids\teams_ids.csv, vct_2025\matches\draft_phase.csv, vct_2025\matches\eco_rounds.csv, vct_2025\matches\eco_stats.csv, vct_2025\matches\kills_stats.csv, vct_2025\matches\overview.csv, vct_2025\matches\win_loss_methods_count.csv, vct_2025\matches\win_loss_methods_round_number.csv, vct_2026\agents\teams_picked_agents.csv, vct_2026\ids\teams_ids.csv, vct_2026\matches\draft_phase.csv, vct_2026\matches\eco_rounds.csv, vct_2026\matches\eco_stats.csv, vct_2026\matches\kills_stats.csv, vct_2026\matches\overview.csv, vct_2026\matches\win_loss_methods_count.csv, vct_2026\matches\win_loss_methods_round_number.csv |
| Team A | vct_2021\matches\maps_scores.csv, vct_2021\matches\scores.csv, vct_2022\matches\maps_scores.csv, vct_2022\matches\scores.csv, vct_2023\matches\maps_scores.csv, vct_2023\matches\scores.csv, vct_2024\matches\maps_scores.csv, vct_2024\matches\scores.csv, vct_2025\matches\maps_scores.csv, vct_2025\matches\scores.csv, vct_2026\matches\maps_scores.csv, vct_2026\matches\scores.csv |
| Team A Attacker Score | vct_2021\matches\maps_scores.csv, vct_2022\matches\maps_scores.csv, vct_2023\matches\maps_scores.csv, vct_2024\matches\maps_scores.csv, vct_2025\matches\maps_scores.csv, vct_2026\matches\maps_scores.csv |
| Team A Defender Score | vct_2021\matches\maps_scores.csv, vct_2022\matches\maps_scores.csv, vct_2023\matches\maps_scores.csv, vct_2024\matches\maps_scores.csv, vct_2025\matches\maps_scores.csv, vct_2026\matches\maps_scores.csv |
| Team A Overtime Score | vct_2021\matches\maps_scores.csv, vct_2022\matches\maps_scores.csv, vct_2023\matches\maps_scores.csv, vct_2024\matches\maps_scores.csv, vct_2025\matches\maps_scores.csv, vct_2026\matches\maps_scores.csv |
| Team A Score | vct_2021\matches\maps_scores.csv, vct_2021\matches\scores.csv, vct_2022\matches\maps_scores.csv, vct_2022\matches\scores.csv, vct_2023\matches\maps_scores.csv, vct_2023\matches\scores.csv, vct_2024\matches\maps_scores.csv, vct_2024\matches\scores.csv, vct_2025\matches\maps_scores.csv, vct_2025\matches\scores.csv, vct_2026\matches\maps_scores.csv, vct_2026\matches\scores.csv |
| Team B | vct_2021\matches\maps_scores.csv, vct_2021\matches\scores.csv, vct_2022\matches\maps_scores.csv, vct_2022\matches\scores.csv, vct_2023\matches\maps_scores.csv, vct_2023\matches\scores.csv, vct_2024\matches\maps_scores.csv, vct_2024\matches\scores.csv, vct_2025\matches\maps_scores.csv, vct_2025\matches\scores.csv, vct_2026\matches\maps_scores.csv, vct_2026\matches\scores.csv |
| Team B Attacker Score | vct_2021\matches\maps_scores.csv, vct_2022\matches\maps_scores.csv, vct_2023\matches\maps_scores.csv, vct_2024\matches\maps_scores.csv, vct_2025\matches\maps_scores.csv, vct_2026\matches\maps_scores.csv |
| Team B Defender Score | vct_2021\matches\maps_scores.csv, vct_2022\matches\maps_scores.csv, vct_2023\matches\maps_scores.csv, vct_2024\matches\maps_scores.csv, vct_2025\matches\maps_scores.csv, vct_2026\matches\maps_scores.csv |
| Team B Overtime Score | vct_2021\matches\maps_scores.csv, vct_2022\matches\maps_scores.csv, vct_2023\matches\maps_scores.csv, vct_2024\matches\maps_scores.csv, vct_2025\matches\maps_scores.csv, vct_2026\matches\maps_scores.csv |
| Team B Score | vct_2021\matches\maps_scores.csv, vct_2021\matches\scores.csv, vct_2022\matches\maps_scores.csv, vct_2022\matches\scores.csv, vct_2023\matches\maps_scores.csv, vct_2023\matches\scores.csv, vct_2024\matches\maps_scores.csv, vct_2024\matches\scores.csv, vct_2025\matches\maps_scores.csv, vct_2025\matches\scores.csv, vct_2026\matches\maps_scores.csv, vct_2026\matches\scores.csv |
| Team ID | all_ids\all_teams_ids.csv, vct_2021\ids\teams_ids.csv, vct_2022\ids\teams_ids.csv, vct_2023\ids\teams_ids.csv, vct_2024\ids\teams_ids.csv, vct_2025\ids\teams_ids.csv, vct_2026\ids\teams_ids.csv |
| Teams | vct_2021\players_stats\players_stats.csv, vct_2022\players_stats\players_stats.csv, vct_2023\players_stats\players_stats.csv, vct_2024\players_stats\players_stats.csv, vct_2025\players_stats\players_stats.csv, vct_2026\players_stats\players_stats.csv |
| Time Expiry (Failed to Plant) | vct_2021\matches\win_loss_methods_count.csv, vct_2022\matches\win_loss_methods_count.csv, vct_2023\matches\win_loss_methods_count.csv, vct_2024\matches\win_loss_methods_count.csv, vct_2025\matches\win_loss_methods_count.csv, vct_2026\matches\win_loss_methods_count.csv |
| Time Expiry (No Plant) | vct_2021\matches\win_loss_methods_count.csv, vct_2022\matches\win_loss_methods_count.csv, vct_2023\matches\win_loss_methods_count.csv, vct_2024\matches\win_loss_methods_count.csv, vct_2025\matches\win_loss_methods_count.csv, vct_2026\matches\win_loss_methods_count.csv |
| Total Loss By Map | vct_2021\agents\teams_picked_agents.csv, vct_2022\agents\teams_picked_agents.csv, vct_2023\agents\teams_picked_agents.csv, vct_2024\agents\teams_picked_agents.csv, vct_2025\agents\teams_picked_agents.csv, vct_2026\agents\teams_picked_agents.csv |
| Total Maps Played | vct_2021\agents\maps_stats.csv, vct_2021\agents\teams_picked_agents.csv, vct_2022\agents\maps_stats.csv, vct_2022\agents\teams_picked_agents.csv, vct_2023\agents\maps_stats.csv, vct_2023\agents\teams_picked_agents.csv, vct_2024\agents\maps_stats.csv, vct_2024\agents\teams_picked_agents.csv, vct_2025\agents\maps_stats.csv, vct_2025\agents\teams_picked_agents.csv, vct_2026\agents\maps_stats.csv, vct_2026\agents\teams_picked_agents.csv |
| Total Wins By Map | vct_2021\agents\teams_picked_agents.csv, vct_2022\agents\teams_picked_agents.csv, vct_2023\agents\teams_picked_agents.csv, vct_2024\agents\teams_picked_agents.csv, vct_2025\agents\teams_picked_agents.csv, vct_2026\agents\teams_picked_agents.csv |
| Tournament | all_ids\all_matches_games_ids.csv, all_ids\all_tournaments_stages_match_types_ids.csv, vct_2021\agents\agents_pick_rates.csv, vct_2021\agents\maps_stats.csv, vct_2021\agents\teams_picked_agents.csv, vct_2021\ids\tournaments_stages_match_types_ids.csv, vct_2021\ids\tournaments_stages_matches_games_ids.csv, vct_2021\matches\draft_phase.csv, vct_2021\matches\eco_rounds.csv, vct_2021\matches\eco_stats.csv, vct_2021\matches\kills.csv, vct_2021\matches\kills_stats.csv, vct_2021\matches\maps_played.csv, vct_2021\matches\maps_scores.csv, vct_2021\matches\overview.csv, vct_2021\matches\rounds_kills.csv, vct_2021\matches\scores.csv, vct_2021\matches\win_loss_methods_count.csv, vct_2021\matches\win_loss_methods_round_number.csv, vct_2021\players_stats\players_stats.csv, vct_2022\agents\agents_pick_rates.csv, vct_2022\agents\maps_stats.csv, vct_2022\agents\teams_picked_agents.csv, vct_2022\ids\tournaments_stages_match_types_ids.csv, vct_2022\ids\tournaments_stages_matches_games_ids.csv, vct_2022\matches\draft_phase.csv, vct_2022\matches\eco_rounds.csv, vct_2022\matches\eco_stats.csv, vct_2022\matches\kills.csv, vct_2022\matches\kills_stats.csv, vct_2022\matches\maps_played.csv, vct_2022\matches\maps_scores.csv, vct_2022\matches\overview.csv, vct_2022\matches\rounds_kills.csv, vct_2022\matches\scores.csv, vct_2022\matches\win_loss_methods_count.csv, vct_2022\matches\win_loss_methods_round_number.csv, vct_2022\players_stats\players_stats.csv, vct_2023\agents\agents_pick_rates.csv, vct_2023\agents\maps_stats.csv, vct_2023\agents\teams_picked_agents.csv, vct_2023\ids\tournaments_stages_match_types_ids.csv, vct_2023\ids\tournaments_stages_matches_games_ids.csv, vct_2023\matches\draft_phase.csv, vct_2023\matches\eco_rounds.csv, vct_2023\matches\eco_stats.csv, vct_2023\matches\kills.csv, vct_2023\matches\kills_stats.csv, vct_2023\matches\maps_played.csv, vct_2023\matches\maps_scores.csv, vct_2023\matches\overview.csv, vct_2023\matches\rounds_kills.csv, vct_2023\matches\scores.csv, vct_2023\matches\win_loss_methods_count.csv, vct_2023\matches\win_loss_methods_round_number.csv, vct_2023\players_stats\players_stats.csv, vct_2024\agents\agents_pick_rates.csv, vct_2024\agents\maps_stats.csv, vct_2024\agents\teams_picked_agents.csv, vct_2024\ids\tournaments_stages_match_types_ids.csv, vct_2024\ids\tournaments_stages_matches_games_ids.csv, vct_2024\matches\draft_phase.csv, vct_2024\matches\eco_rounds.csv, vct_2024\matches\eco_stats.csv, vct_2024\matches\kills.csv, vct_2024\matches\kills_stats.csv, vct_2024\matches\maps_played.csv, vct_2024\matches\maps_scores.csv, vct_2024\matches\overview.csv, vct_2024\matches\rounds_kills.csv, vct_2024\matches\scores.csv, vct_2024\matches\win_loss_methods_count.csv, vct_2024\matches\win_loss_methods_round_number.csv, vct_2024\players_stats\players_stats.csv, vct_2025\agents\agents_pick_rates.csv, vct_2025\agents\maps_stats.csv, vct_2025\agents\teams_picked_agents.csv, vct_2025\ids\tournaments_stages_match_types_ids.csv, vct_2025\ids\tournaments_stages_matches_games_ids.csv, vct_2025\matches\draft_phase.csv, vct_2025\matches\eco_rounds.csv, vct_2025\matches\eco_stats.csv, vct_2025\matches\kills.csv, vct_2025\matches\kills_stats.csv, vct_2025\matches\maps_played.csv, vct_2025\matches\maps_scores.csv, vct_2025\matches\overview.csv, vct_2025\matches\rounds_kills.csv, vct_2025\matches\scores.csv, vct_2025\matches\win_loss_methods_count.csv, vct_2025\matches\win_loss_methods_round_number.csv, vct_2025\players_stats\players_stats.csv, vct_2026\agents\agents_pick_rates.csv, vct_2026\agents\maps_stats.csv, vct_2026\agents\teams_picked_agents.csv, vct_2026\ids\tournaments_stages_match_types_ids.csv, vct_2026\ids\tournaments_stages_matches_games_ids.csv, vct_2026\matches\draft_phase.csv, vct_2026\matches\eco_rounds.csv, vct_2026\matches\eco_stats.csv, vct_2026\matches\kills.csv, vct_2026\matches\kills_stats.csv, vct_2026\matches\maps_played.csv, vct_2026\matches\maps_scores.csv, vct_2026\matches\overview.csv, vct_2026\matches\rounds_kills.csv, vct_2026\matches\scores.csv, vct_2026\matches\win_loss_methods_count.csv, vct_2026\matches\win_loss_methods_round_number.csv, vct_2026\players_stats\players_stats.csv |
| Tournament ID | all_ids\all_matches_games_ids.csv, all_ids\all_tournaments_stages_match_types_ids.csv, vct_2021\ids\tournaments_stages_match_types_ids.csv, vct_2021\ids\tournaments_stages_matches_games_ids.csv, vct_2022\ids\tournaments_stages_match_types_ids.csv, vct_2022\ids\tournaments_stages_matches_games_ids.csv, vct_2023\ids\tournaments_stages_match_types_ids.csv, vct_2023\ids\tournaments_stages_matches_games_ids.csv, vct_2024\ids\tournaments_stages_match_types_ids.csv, vct_2024\ids\tournaments_stages_matches_games_ids.csv, vct_2025\ids\tournaments_stages_match_types_ids.csv, vct_2025\ids\tournaments_stages_matches_games_ids.csv, vct_2026\ids\tournaments_stages_match_types_ids.csv, vct_2026\ids\tournaments_stages_matches_games_ids.csv |
| Type | vct_2021\matches\eco_rounds.csv, vct_2021\matches\eco_stats.csv, vct_2022\matches\eco_rounds.csv, vct_2022\matches\eco_stats.csv, vct_2023\matches\eco_rounds.csv, vct_2023\matches\eco_stats.csv, vct_2024\matches\eco_rounds.csv, vct_2024\matches\eco_stats.csv, vct_2025\matches\eco_rounds.csv, vct_2025\matches\eco_stats.csv, vct_2026\matches\eco_rounds.csv, vct_2026\matches\eco_stats.csv |
| Won | vct_2021\matches\eco_stats.csv, vct_2022\matches\eco_stats.csv, vct_2023\matches\eco_stats.csv, vct_2024\matches\eco_stats.csv, vct_2025\matches\eco_stats.csv, vct_2026\matches\eco_stats.csv |
| Year | all_ids\all_matches_games_ids.csv, all_ids\all_tournaments_stages_match_types_ids.csv |