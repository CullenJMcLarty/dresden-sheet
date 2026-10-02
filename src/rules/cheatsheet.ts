/**
 * Quick-reference rules for the Dresden Files RPG, summarised in our own words.
 * Page numbers refer to The Dresden Files RPG, Vol. 1: Your Story (YS).
 * Text supports **bold** for emphasis.
 */

export type Block =
  | { p: string }
  | { list: string[] }
  | { steps: string[] }
  | { table: { head: string[]; rows: string[][] } }

export interface RuleSection {
  id: string
  title: string
  pages: string
  blocks: Block[]
}

export const CHEATSHEET: RuleSection[] = [
  {
    id: 'dice',
    title: 'Rolling & the Ladder',
    pages: 'YS16–17, 192',
    blocks: [
      { p: 'Roll **4 Fudge dice** (each −1, 0 or +1, so −4 to +4) and add your skill. No Fudge dice? Roll 4d6: 1–2 is −, 3–4 is 0, 5–6 is +.' },
      { p: '**Effort** = skill + dice. Meet the difficulty to succeed. Every point above it is a **shift**. Missing is just a failure; there are no negative shifts.' },
      {
        table: {
          head: ['Rating', 'Ladder'],
          rows: [
            ['+8', 'Legendary'],
            ['+7', 'Epic'],
            ['+6', 'Fantastic'],
            ['+5', 'Superb'],
            ['+4', 'Great'],
            ['+3', 'Good'],
            ['+2', 'Fair'],
            ['+1', 'Average'],
            ['0', 'Mediocre'],
            ['−1', 'Poor'],
            ['−2', 'Terrible'],
          ],
        },
      },
      { p: 'Skills you don\'t have default to **Mediocre (+0)**. Results past the ends of the ladder just use the number.' },
      { p: 'Spend shifts on a simple action to do it **faster**, more **subtly**, or with better **quality** (the quality becomes the difficulty for anyone working against it later).' },
    ],
  },
  {
    id: 'actions',
    title: 'Actions Outside Conflict',
    pages: 'YS192–196, 213',
    blocks: [
      {
        list: [
          '**Simple action**: roll against a difficulty the GM sets.',
          '**Contest**: both sides roll; high roll wins. A tie means both succeed, or roll again.',
          '**Consequential contest**: the loser also takes a consequence. Lose by 2 for a mild, 4 for a moderate, 6+ for a severe.',
          '**Assessment**: roll to discover an existing aspect on a person, place or thing.',
          '**Declaration**: roll to make a new fact true and add it as an aspect. If you fail, it isn\'t true (or you only believe it is).',
          '**Extended contest**: a series of rolls racing to a shift total or a deadline.',
        ],
      },
      { p: '**Combining skills**: roll the main skill; a second skill that\'s higher gives +1, lower gives −1 (ignore whichever direction doesn\'t make sense).' },
      { p: 'Difficulty guide: Average is hard for the untrained, Fair–Good is professional work, Great–Superb is mastery, beyond Superb is superhuman.' },
    ],
  },
  {
    id: 'fate',
    title: 'Fate Points',
    pages: 'YS19–21, 98–107',
    blocks: [
      { p: '**Spend one to:**' },
      {
        list: [
          '**+1** to any roll or effort (the weakest option).',
          '**Invoke an aspect**: after rolling, either **reroll all four dice** or take **+2**. You can stack different aspects, but each aspect only once per roll.',
          '**Invoke for effect**: use an aspect to declare a helpful fact, with no roll.',
          '**Declare** a minor fact or coincidence. The GM can veto it, but is generous if it fits your aspects and makes the game cooler.',
          'Fuel stunts or powers that call for it.',
        ],
      },
      { p: '**Earn them from compels.** When an aspect complicates your life, accept the complication and take a fate point, or pay one to avoid it. The GM can **escalate** a big moment: the reward and the cost both rise to 2, then 3.' },
      { p: '**Refresh** at the start of each session: top up to your refresh. If you already have more, you keep them. You also **cash out** one fate point per consequence you took when you lose or concede a conflict.' },
      { p: 'Refresh is reduced by stunts and powers. If it drops to **0 or below**, the character becomes an NPC.' },
    ],
  },
  {
    id: 'aspects',
    title: 'Aspects & Tags',
    pages: 'YS98–117, 207–208',
    blocks: [
      { p: 'An aspect can be used **for** you (invoke, which costs a fate point) or **against** you (compel, which pays you a fate point).' },
      { p: '**Tag**: when you discover or create an aspect (assessment, declaration, maneuver, inflicting a consequence), you get **one free invoke** of it, used right away or at least within that scene. You can hand the tag to an ally.' },
      {
        list: [
          '**Fragile** aspect: a maneuver with exactly 0 shifts. Tag it once and it\'s gone.',
          '**Sticky** aspect: a maneuver with 1+ shifts. It stays until someone uses an action to remove it. Invokes after the free tag cost fate points.',
          '**Scene aspects** can be invoked by anyone in the scene. Five or so is a good number.',
          'Invoking someone else\'s aspect needs a little more justification than your own. Aspects on opponents must be known first.',
        ],
      },
    ],
  },
  {
    id: 'conflict',
    title: 'Running a Conflict',
    pages: 'YS197–199',
    blocks: [
      {
        steps: [
          '**Frame the scene**: zones (areas where people can touch each other) and scene aspects.',
          '**Set the sides**: who is facing whom, and where everyone starts.',
          '**Initiative**: Alertness (physical), Empathy (social), Discipline (mental). Break ties with another fitting skill, such as Athletics.',
          '**Exchanges**: everyone takes one turn in initiative order, then repeat. You may **delay** your turn to interrupt someone later; your place stays there afterwards.',
        ],
      },
      { p: 'Range by zones: same zone, you can touch; 1 zone, you can throw things; 2 zones or more, guns (some reach farther).' },
    ],
  },
  {
    id: 'conflict-actions',
    title: 'Conflict Actions',
    pages: 'YS199–214',
    blocks: [
      {
        list: [
          '**Attack**: roll against the target\'s defense. Your shifts are stress dealt.',
          '**Maneuver**: place a temporary aspect on a target or the scene (against their defense, or a GM difficulty), or remove one.',
          '**Block**: name an action and roll; your total is the **block strength**. Anyone attempting that action must meet it. It lasts until your next turn, when you can roll to keep it up.',
          '**Sprint**: move zones. Mediocre difficulty for 1 zone, +1 zone per shift. Borders (fences, walls) have their own difficulty.',
          '**Full defense**: take no action and get **+2 to all defense rolls** this exchange.',
        ],
      },
      { p: '**Free actions**: defending, and quick trivial things like a glance or a shout. There\'s no limit, as long as the group agrees. **Supplemental actions** (moving 1 zone, drawing a weapon) give **−1** to your main action.' },
      { p: '**Grapple**: tag or invoke an aspect that justifies it, then roll Might as a block against everything the target does. Each later turn you can deal 1 stress, move them a zone, or add a maneuver as a supplemental action (−1 to the grapple roll).' },
      { p: '**Overflow**: spare shifts after a success can buy one extra non-attack action at that value. **Spin** (optional): beat an attack by 3+ on defense to give ±1 to the next action.' },
    ],
  },
  {
    id: 'skills-in-conflict',
    title: 'Which Skill?',
    pages: 'YS200, 215–218',
    blocks: [
      {
        table: {
          head: ['', 'Physical', 'Social', 'Mental'],
          rows: [
            ['Attack', 'Fists, Guns, Weapons', 'Deceit, Intimidation, Rapport', 'Spells and powers, or deep established relationships'],
            ['Maneuver', 'Athletics, Might, most skills', 'Deceit, Intimidation, Rapport, Empathy', 'Like social, but deeper'],
            ['Defend', 'Athletics (Fists vs Fists; Weapons vs Weapons or Fists)', 'Empathy, Rapport (sometimes Discipline)', 'Discipline'],
            ['Initiative', 'Alertness', 'Empathy', 'Discipline'],
            ['Stress track', 'Endurance', 'Presence', 'Conviction'],
          ],
        },
      },
      { p: 'Hunger stress (for templates that feed) uses Discipline. Assess an opponent socially with Empathy, usually resisted by Rapport.' },
    ],
  },
  {
    id: 'stress',
    title: 'Stress, Weapons & Armor',
    pages: 'YS130, 201–203',
    blocks: [
      { p: 'A hit for **N** stress checks **box N** only. If it\'s already checked, **roll up** to the next empty box. If it would go past the last box, take a consequence or be **taken out**.' },
      { p: '**Weapon:N** adds N to the stress of a hit, and **Armor:N** subtracts N. A tie on an attack still connects, so a weapon still deals its rating.' },
      {
        table: {
          head: ['Endurance / Presence / Conviction', 'Boxes'],
          rows: [
            ['Mediocre', '2'],
            ['Average or Fair', '3'],
            ['Good or Great', '4'],
            ['Superb or better', '4, plus one extra mild consequence per two full levels above Good'],
          ],
        },
      },
      { p: 'Powers can add more: Inhuman, Supernatural and Mythic Toughness give +2, +4 and +6 physical boxes, with Armor 1, 2 and 3. All stress clears when the conflict ends.' },
    ],
  },
  {
    id: 'consequences',
    title: 'Consequences',
    pages: 'YS203–205, 220',
    blocks: [
      {
        table: {
          head: ['Severity', 'Absorbs', 'Lasts after recovery starts'],
          rows: [
            ['Mild', '2', 'until the end of the next scene'],
            ['Moderate', '4', 'until the end of the next session'],
            ['Severe', '6', 'until the end of the next scenario (or a few sessions)'],
            ['Extreme', '8', 'permanent: replace one of your aspects (not your high concept or trouble)'],
          ],
        },
      },
      {
        list: [
          'Take them **when you\'re hit**, never afterwards to clear stress already marked. You can stack several on one hit.',
          'One of each by default, and they can absorb physical, mental or social harm. Bonus slots from skills or powers only cover their own kind.',
          'A consequence is an aspect: the attacker gets **a free tag** on it, and it can be invoked and compelled.',
          'Recovery needs an in-story justification first (rest, medical care, therapy…). A healer under pressure rolls Fair, Great or Fantastic for mild, moderate or severe.',
          'The extreme slot reopens only at a major milestone (or every three scenarios).',
        ],
      },
    ],
  },
  {
    id: 'losing',
    title: 'Taken Out & Concessions',
    pages: 'YS203, 206',
    blocks: [
      { p: '**Taken out**: the winner decides how you lose, within reason and only in that arena (losing socially doesn\'t knock you unconscious). You still control the color and your own last words.' },
      { p: '**Concede** before the roll that would take you out: you lose, but on your terms. The group must agree the loss is real, for example a moderate or worse consequence, a big future problem, or a new restriction such as a debt.' },
      { p: 'Either way, **cash out**: one fate point per consequence taken in that conflict. If death is on the table, it should be announced at the start of the conflict.' },
    ],
  },
  {
    id: 'evocation',
    title: 'Evocation',
    pages: 'YS249–260',
    blocks: [
      {
        steps: [
          'Pick an **element** (earth, air, fire, water, spirit) and an action: **attack, block, maneuver or counterspell**.',
          'Choose the **power**. It costs **1 mental stress**, plus 1 more for every shift above your **Conviction**.',
          'Roll **Discipline** against the power. The total is also your attack roll and targeting.',
          'Fall short and the excess escapes as **backlash** (stress to you, all physical or all mental) or **fallout** (harm to the surroundings, which also weakens the spell). You choose the split.',
        ],
      },
      {
        list: [
          '**Attack**: each shift of power is +1 Weapon.',
          '**Block**: each shift is +1 block strength (or Armor, or a border). Any attack that gets past it ends the block.',
          '**Maneuver**: usually 3 shifts, or the target\'s resisting skill if that\'s higher than Good.',
          '**Rotes**: you know as many as your Lore rating. A rote is one exact spell, and its control counts as if you rolled 0. You still roll to target it.',
          '**Focus items and specializations**: +1 to Conviction (power) or to Discipline (control) for a specific use.',
        ],
      },
    ],
  },
  {
    id: 'thaumaturgy',
    title: 'Thaumaturgy',
    pages: 'YS261–272',
    blocks: [
      { p: 'Ritual magic for anything that isn\'t a quick combat effect. The **complexity** is roughly the difficulty the same result would have as a normal action.' },
      {
        steps: [
          'If the complexity is **at or below your Lore** (plus foci), go straight to casting.',
          'Otherwise **prepare**: research the ritual, get better symbolic links, and find extra power sources. This takes time and scenes.',
          'Without pressure, the spell simply works. **Under pressure**, each exchange you draw power up to your Conviction (more costs mental stress) and control it with Discipline, carrying the controlled shifts forward until they reach the complexity.',
        ],
      },
      { p: 'Breaking off safely puts you back at square one. Failed control turns into backlash or fallout, as with evocation.' },
    ],
  },
  {
    id: 'laws',
    title: 'The Laws of Magic',
    pages: 'YS232–245',
    blocks: [
      {
        steps: [
          'Never kill with magic.',
          'Never transform another.',
          'Never invade the thoughts of another.',
          'Never enthrall another.',
          'Never reach beyond the borders of life.',
          'Never swim against the currents of time.',
          'Never seek knowledge or power from beyond the Outer Gates.',
        ],
      },
      { p: 'Breaking a Law taints you: the Lawbreaker power, and aspects that drift toward the dark. Violating the First Law even by accident (a fall caused by your spell) still counts.' },
    ],
  },
  {
    id: 'advancement',
    title: 'Advancement',
    pages: 'YS88–91',
    blocks: [
      { p: '**Minor milestone** (end of a session). Pick **one**:' },
      {
        list: [
          'Swap the ratings of two skills, or trade an Average skill for a new one.',
          'Swap one stunt for another.',
          'Buy stunts or powers if you have the refresh.',
          'Rename one aspect (not the high concept; a trouble can only be replaced with a new trouble).',
        ],
      },
      { p: '**Significant milestone** (end of a scenario): **+1 skill point**, one minor-milestone benefit, and casters can rework their foci. The skill column rule still applies.' },
      { p: '**Major milestone** (a big arc ends): everything in a significant milestone, **+1 refresh**, new stunts or powers, the extreme consequence slot reopens, and sometimes the skill cap rises by one.' },
    ],
  },
  {
    id: 'creation',
    title: 'Building a Character',
    pages: 'YS52–70 (power levels YS53)',
    blocks: [
      {
        table: {
          head: ['Power level', 'Refresh', 'Skill points', 'Skill cap'],
          rows: [
            ['Feet in the Water', '6', '20', 'Great (+4)'],
            ['Up to Your Waist', '7', '25', 'Great (+4)'],
            ['Chest-Deep', '8', '30', 'Superb (+5)'],
            ['Submerged', '10', '35', 'Superb (+5)'],
          ],
        },
      },
      {
        list: [
          'Seven aspects: **high concept**, **trouble**, and one from each of the five phases.',
          'A skill costs points equal to its rating. **Column rule**: no rating can hold more skills than the rating below it.',
          'Stunts and powers cost refresh, and you must keep at least 1. **Pure Mortals** get **+2 refresh** but can\'t take supernatural powers.',
          'Templates list required powers ("musts"). Check that you can afford them at your power level.',
        ],
      },
    ],
  },
]

/** Lower-cased searchable text for a section. */
export function sectionText(s: RuleSection): string {
  const parts: string[] = [s.title]
  for (const b of s.blocks) {
    if ('p' in b) parts.push(b.p)
    else if ('list' in b) parts.push(...b.list)
    else if ('steps' in b) parts.push(...b.steps)
    else parts.push(...b.table.head, ...b.table.rows.flat())
  }
  return parts.join(' ').replace(/\*\*/g, '').toLowerCase()
}
