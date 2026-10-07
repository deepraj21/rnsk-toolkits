// @ts-nocheck
// Guide content for every Mermaid diagram type.
// Syntax verified against the Mermaid docs (docs.mermaidchart.com, v11/v12).
// No API calls — pure guidance text returned to the agent.

export interface DiagramGuide {
  keyword: string;
  title: string;
  whenToUse: string;
  rules: string[];
  example: string;
  pitfalls: string[];
}

export const GUIDES: Record<string, DiagramGuide> = {
  flowchart: {
    keyword: 'flowchart',
    title: 'Flowchart',
    whenToUse:
      'Processes, decisions, pipelines, and any node-and-edge flow. The default choice for workflows and system flows.',
    rules: [
      'Start with `flowchart TD` (top-down), `LR` (left-right), `BT`, or `RL`. `graph` is a legacy alias.',
      'Nodes: A[text] rectangle, A(text) rounded, A{rhom} decision, A{{hex}}, A[/par/], A[\\alt\\], A[/trap/], A[\\trap-alt/], A((circle)), A([stadium]), A[[subroutine]], A[(cylinder)], A@{ shape: rect } for any of 30+ shapes.',
      'Edges: A-->B arrow, A---B line, A-.->B dotted, A==>B thick, A-- text -->B or A---|text|B labels, o/x prefixes make circle/cross ends, e1@--> named edges.',
      'Subgraphs: `subgraph id [Title]` ... `end`, each can set its own direction.',
      'Style with `classDef name fill:#f9f,stroke:#333`, `class A,B name`, `style A fill:#f9f`, `linkStyle`, and `click A "https://url" "tooltip"`.',
      'Comments start with `%%`. Markdown in labels needs double quotes.',
    ],
    example: `flowchart TD
    A[Start] --> B{Approved?}
    B -- Yes --> C[Deploy]
    B -- No --> D[Revise]
    D --> B`,
    pitfalls: [
      'Never write lowercase `end` as node text — capitalize it (End/END).',
      'Do not start a linked node id with lowercase o or x (A---oB makes a circle edge); add a space or capitalize.',
      'In v11+, plain labels are Markdown: escape or quote special chars; \\n needs quoted strings.',
    ],
  },
  sequence: {
    keyword: 'sequenceDiagram',
    title: 'Sequence diagram',
    whenToUse:
      'Interactions between actors/services over time: API calls, auth flows, message passing.',
    rules: [
      'Start with `sequenceDiagram`. Declare `participant A as Name` or `actor A as Name`.',
      'Messages: -> solid, --> dotted, ->> / -->> arrowheads, <<->> / <<-->> bidirectional, -x / --x loss, -) / --) async. Format: `A->>B: text`.',
      'Notes: `Note right of A: text`, `Note left of`, `Note over A,B: text`.',
      'Blocks: `loop text ... end`, `alt text ... else ... end`, `opt ... end`, `par ... and ... end`, `rect color ... end`, `critical ... option ... end`, `break ... end`.',
      '`autonumber` numbers messages; `activate A` / `deactivate A` show lifelines.',
      'Avoid the bare word `end` in names; quote strings with colons/semicolons.',
    ],
    example: `sequenceDiagram
    participant U as User
    participant A as API
    U->>A: POST /login
    activate A
    A-->>U: 200 token
    deactivate A`,
    pitfalls: [
      'Every block keyword (loop/alt/opt/par/rect) must be closed with `end`.',
      'Actor names with spaces need aliases: `participant A as Order Service`.',
      'Message text with `#` or `;` should be quoted.',
    ],
  },
  class: {
    keyword: 'classDiagram',
    title: 'Class diagram',
    whenToUse: 'Object models, domain entities, service structures, and their relationships.',
    rules: [
      'Start with `classDiagram`. Declare `class Animal` with members on following lines: `+publicMethod()`, `-privateField type`, `#protected`, `~package`.',
      'Generics use tildes: `List~int~`. Return types go after `()`: `+get() int`.',
      'Relations: `<|--` inheritance, `*--` composition, `o--` aggregation, `-->` association, `--` link, `..>` dependency, `..|>` realization. Cardinality: `"1" --> "*"`. Labels after `:` .',
      'Annotations: `<<interface>> Shape`, `<<abstract>>`, `<<enumeration>>`, `<<service>>`.',
      'Notes: `note for Shape "text"`. Namespaces: `namespace com.example { class X }`.',
      'Two-way relations and lollipop interfaces (`()--`) are supported.',
    ],
    example: `classDiagram
    class Order {
        +int id
        +Money total()
        +place()
    }
    class Customer {
        +String name
    }
    Customer "1" --> "*" Order : places
    Order *-- OrderLine`,
    pitfalls: [
      'Member lines must be indented under the class or use `Class : +member()` syntax.',
      'Generic brackets are tildes (`List~T~`), not angle brackets.',
      'Relation direction matters: arrowhead side is the target (`Child --|> Parent` is wrong; use `<|` on the parent side).',
    ],
  },
  state: {
    keyword: 'stateDiagram-v2',
    title: 'State diagram',
    whenToUse: 'Lifecycles: order states, CI job states, connection states, game states.',
    rules: [
      'Start with `stateDiagram-v2`. `[*]` is start/end: `[*] --> Active`, `Active --> [*]`.',
      'Transitions: `Active --> Paused : pause`. Descriptions may contain colons.',
      'Named states: `state "Long name" as s1`. Composite: `state Active { [*] --> Sub }`.',
      'Concurrency: `--` separates regions; `fork`/`join` with `<<fork>>` / `<<join>>`; `choice` for conditional.',
      'Notes: `note right of Active : text` (also left of, multi-line with `end note`).',
    ],
    example: `stateDiagram-v2
    [*] --> Draft
    Draft --> Review : submit
    Review --> Approved : approve
    Review --> Draft : reject
    Approved --> [*]`,
    pitfalls: [
      'Use `stateDiagram-v2`; the v1 `stateDiagram` keyword is legacy.',
      'State names with spaces need `state "Name" as id` aliasing.',
      'Concurrent regions need `--` separators inside the composite state.',
    ],
  },
  er: {
    keyword: 'erDiagram',
    title: 'Entity Relationship diagram',
    whenToUse: 'Database schemas: entities, keys, and cardinalities.',
    rules: [
      'Start with `erDiagram`. Relationship line: `CUSTOMER ||--o{ ORDER : places`.',
      'Cardinality glyphs: `||` exactly one, `o|` zero-or-one, `}|` one-or-more, `}o` zero-or-more. Read left-to-right.',
      'Attributes inside blocks: `type name PK`, `type name FK`, `type name UK`. Quoted names allow spaces/numbers.',
      'Identifying vs non-identifying: `--` (solid) vs `..` (dotted) relationship lines.',
      'Alias attribute blocks with `["..."]` display labels when needed.',
    ],
    example: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE_ITEM : contains
    CUSTOMER {
        string id PK
        string name
    }
    ORDER {
        string id PK
        string customer_id FK
    }`,
    pitfalls: [
      'Attribute types with spaces or starting with digits must be quoted.',
      'Relationship operator order matters (`||--o{` is not `{o--||`).',
      'Only PK/FK/UK markers are recognized after attribute names.',
    ],
  },
  journey: {
    keyword: 'journey',
    title: 'User journey',
    whenToUse: 'Experience maps: user tasks scored by satisfaction across actors.',
    rules: [
      'Start with `journey`. Optional `title Your Journey`.',
      'Sections: `section Checkout`. Tasks: `Browse catalog: 5: Shopper, Guest`.',
      'Scores are 1-5 and render faces; list every actor after the second colon.',
      'Multiple actors per task show parallel experience lines.',
    ],
    example: `journey
    title Shopping
    section Browse
      View catalog: 5: Shopper
      Compare prices: 3: Shopper
    section Checkout
      Pay: 2: Shopper`,
    pitfalls: [
      'Every task line needs exactly `name: score: actors` — missing actors breaks rendering.',
      'Scores outside 1-5 render incorrectly.',
    ],
  },
  gantt: {
    keyword: 'gantt',
    title: 'Gantt chart',
    whenToUse: 'Project timelines, roadmaps, release plans with dependencies.',
    rules: [
      'Start with `gantt`. Set `title`, `dateFormat YYYY-MM-DD`, `axisFormat %m/%d`, `tickInterval`.',
      'Sections: `section Phase`. Tasks: `Task name :done, id1, 2026-01-01, 2026-01-05` or durations `3d`, or `after id1`.',
      'Tags: `done`, `active`, `crit`, `milestone` (milestones need a date or `after`). Combine: `:crit, done, id, ...`.',
      'Dependencies via `after taskId`; `vert` markers: `vert : milestone, 2026-02-01`.',
      'Excludes: `excludes weekends` / specific dates; `includes` to re-add.',
    ],
    example: `gantt
    title Release
    dateFormat YYYY-MM-DD
    section Build
    Design      :done, d1, 2026-01-01, 2026-01-05
    Implement   :active, d2, after d1, 5d
    section Launch
    Release     :milestone, m1, after d2, 0d`,
    pitfalls: [
      'Milestones with zero length still need a start (`after x, 0d`) or date.',
      'Task IDs referenced by `after` must be defined earlier in the file.',
      'Invalid dates or tick intervals can freeze rendering — keep dateFormat consistent.',
    ],
  },
  pie: {
    keyword: 'pie',
    title: 'Pie chart',
    whenToUse: 'Simple part-to-whole proportions without hierarchy.',
    rules: [
      'Start with `pie`, optional `showData`, optional `title Title`.',
      'Slices: `"Label" : 42`. Labels with special chars must be quoted.',
      'Values are numbers; percentages are computed automatically.',
    ],
    example: `pie showData title Traffic
    "Organic" : 45
    "Paid" : 25
    "Referral" : 30`,
    pitfalls: ['Negative values are not supported.', 'For hierarchies use treemap, not pie.'],
  },
  quadrant: {
    keyword: 'quadrantChart',
    title: 'Quadrant chart',
    whenToUse: '2x2 prioritization: risk/value, effort/impact, build-vs-buy.',
    rules: [
      'Start with `quadrantChart`. Optional `title`, `x-axis Low --> High`, `y-axis Low --> High`.',
      'Quadrant labels: `quadrant-1 Do`, `quadrant-2 Plan`, `quadrant-3 Delegate`, `quadrant-4 Drop`.',
      'Points: `Alpha: [0.8, 0.7]` with x,y in 0-1 range.',
    ],
    example: `quadrantChart
    title Priorities
    x-axis Low Effort --> High Effort
    y-axis Low Value --> High Value
    quadrant-1 Quick wins
    quadrant-2 Big bets
    Alpha: [0.2, 0.8]
    Beta: [0.7, 0.6]`,
    pitfalls: [
      'Coordinates must be within 0-1; larger values clip.',
      'Quadrant numbering: 1 top-right, 2 top-left, 3 bottom-left, 4 bottom-right.',
    ],
  },
  requirement: {
    keyword: 'requirementDiagram',
    title: 'Requirement diagram',
    whenToUse:
      'Systems engineering: requirements, elements, and traceability (satisfies/verifies).',
    rules: [
      'Start with `requirementDiagram`. Blocks: `requirement login { id: 1, text: "...", risk: high, verifymethod: test }`.',
      'Types: requirement, functionalRequirement, interfaceRequirement, performanceRequirement, physicalRequirement, designConstraint. Also `element device { type: "..." }`.',
      'Relations: `a - satisfies -> b`, `- verifies ->`, `- refines ->`, `- contains ->`, `- copies ->`, `- derives ->`.',
    ],
    example: `requirementDiagram
    requirement auth {
      id: R1
      text: Users must log in.
      risk: high
      verifymethod: test
    }
    element app { type: "web" }
    app - satisfies -> auth`,
    pitfalls: [
      'Relationship keywords need spaces around arrows (`- satisfies ->`).',
      'IDs must be unique across the diagram.',
    ],
  },
  gitgraph: {
    keyword: 'gitGraph',
    title: 'Git graph',
    whenToUse: 'Branching strategies, release flows, merge histories.',
    rules: [
      'Start with `gitGraph` (optional `TB:` / `BT:` orientation on the same line: `gitGraph TB:`).',
      'Commands: `commit`, `commit id:"x" tag:"v1" type:HIGHLIGHT`, `branch name`, `checkout name`, `merge name`, `cherry-pick id:"..."`.',
      'Commit types: NORMAL (default), REVERSE, HIGHLIGHT.',
      'Order commands chronologically; checkout before committing on a branch.',
    ],
    example: `gitGraph
    commit
    branch feature
    checkout feature
    commit
    checkout main
    merge feature`,
    pitfalls: [
      'Merging requires checking out the target branch first.',
      'Cherry-pick needs an existing commit id string.',
    ],
  },
  c4: {
    keyword: 'C4Context',
    title: 'C4 architecture diagram',
    whenToUse: 'Software architecture at context/container/component level (PlantUML-compatible).',
    rules: [
      'Pick one: `C4Context`, `C4Container`, `C4Component`, `C4Dynamic`, `C4Deployment`, then a `title`.',
      'People/systems: `Person(alias, "Label", "descr")`, `Person_Ext`, `System(alias, ...)`, `SystemDb`, `SystemQueue`, `System_Ext`, plus `Container*` and `Component*` variants in deeper diagrams.',
      'Boundaries: `Boundary(alias, "Label")`, `Enterprise_Boundary`, `System_Boundary`, `Container_Boundary`.',
      'Relations: `Rel(a, b, "label", "techn")`, `BiRel`, directional `Rel_U/Rel_D/Rel_L/Rel_R`. Deployment: `Deployment_Node`/`Node`, dynamic: `RelIndex`.',
      'Style last: `UpdateElementStyle(alias, bg, font, border)` and `UpdateRelStyle`. Fixed style set — custom CSS is limited.',
    ],
    example: `C4Context
    title Shop
    Person(buyer, "Buyer", "Shops online")
    System(shop, "Shop", "Sells goods")
    Rel(buyer, shop, "Browses", "HTTPS")`,
    pitfalls: [
      'C4 is experimental: syntax may change between versions.',
      'Aliases must be unique and contain no spaces.',
      'Style statements must come after the elements they reference.',
    ],
  },
  mindmap: {
    keyword: 'mindmap',
    title: 'Mindmap',
    whenToUse: 'Brainstorming, idea trees, org charts, knowledge maps.',
    rules: [
      'Start with `mindmap`, then the root line, then space-indented children (spaces only, consistent depth).',
      'Shapes: `[rect]` default, `(rounded)`, `((circle))`, `))cloud((`, `{{hexagon}}`, `[/parallelogram/]`.',
      'Icons: `Node::icon(fa fa-star)`. Classes: `:::className` with `classDef`.',
      'Keep to ~10 or fewer level-2 nodes for stable auto-layout.',
    ],
    example: `mindmap
  root((Launch))
    Marketing
      Ads
      Blog
    Engineering
      API
      App`,
    pitfalls: [
      'Indentation must be spaces, never tabs, and consistent.',
      'Very wide level-2 fan-out breaks layout; split into multiple maps.',
    ],
  },
  timeline: {
    keyword: 'timeline',
    title: 'Timeline',
    whenToUse: 'Chronologies: roadmaps, histories, project eras.',
    rules: [
      'Start with `timeline`, optional `title Title`.',
      'Eras: `section 2024`. Events: `Q1 : Kickoff : Planning` (period, then colon-separated events).',
      'Multiple events on one line each get their own node.',
    ],
    example: `timeline
    title Roadmap
    section 2026
        Q1 : Kickoff : Hiring
        Q2 : Beta launch
    section 2027
        Q1 : GA`,
    pitfalls: [
      'Events must be indented under their section.',
      'Colons separate period from events — avoid stray colons in labels.',
    ],
  },
  zenuml: {
    keyword: 'zenuml',
    title: 'ZenUML sequence diagram',
    whenToUse: 'Compact sequence diagrams with code-like fragments (try/catch, async).',
    rules: [
      'Start with `zenuml`, optional `title`. Participants are auto-declared: `Alice->Bob: hello`.',
      'Declare with stereotypes: `A as OrderService`, `@Actor User`, `@Database DB`.',
      'Fragments: `if(cond){ ... } else { ... }`, `try { } catch { } finally { }`, `par { }`, `opt { }`, `loop(n){ }`.',
      'Async: `A->B: msg` vs sync `A.method() { }` nesting; `return x`; creation `new X()`; notes via `note`.',
    ],
    example: `zenuml
    title Checkout
    User->API: POST /pay
    API->DB: charge() {
      DB->API: ok
    }
    API->User: receipt`,
    pitfalls: [
      'Braces must balance across fragments.',
      'Method-call nesting uses `{ }` blocks, not activate keywords.',
    ],
  },
  sankey: {
    keyword: 'sankey-beta',
    title: 'Sankey diagram',
    whenToUse: 'Flows with magnitude: traffic, budgets, energy, funnels.',
    rules: [
      'Start with `sankey-beta`. Each line: `Source,Destination,Value` — comma-separated, value numeric.',
      'Node order follows first appearance; widths scale with values.',
      'Beta: syntax may evolve; keep labels short.',
    ],
    example: `sankey-beta
    Ads,Signup,120
    Blog,Signup,80
    Signup,Paid,60`,
    pitfalls: [
      'Values must be numbers (no units or commas).',
      'Node names are case-sensitive; `Ads` and `ads` are different nodes.',
    ],
  },
  xychart: {
    keyword: 'xychart-beta',
    title: 'XY chart',
    whenToUse: 'Bar/line charts from inline data: metrics over time, comparisons.',
    rules: [
      'Start with `xychart-beta`. Optional `title "..."`.',
      'Axes: `x-axis [jan, feb, mar]`, `y-axis "Revenue" 0 --> 100`.',
      'Series: `bar [10, 20, 15]`, `line [12, 18, 22]`. Combine bar+line freely.',
      'Beta: check current docs for new series options.',
    ],
    example: `xychart-beta
    title Signups
    x-axis [jan, feb, mar]
    y-axis "Users" 0 --> 100
    bar [40, 65, 80]
    line [30, 50, 70]`,
    pitfalls: [
      'Series lengths should match x-axis categories.',
      'Axis range uses `min --> max` arrow syntax.',
    ],
  },
  block: {
    keyword: 'block-beta',
    title: 'Block diagram',
    whenToUse: 'Fixed-layout system/network/process blocks where you control placement.',
    rules: [
      'Start with `block-beta`. Grid: `columns 3`, then space-separated blocks per row.',
      'Labels: `id["Label"]`. Shapes mirror flowchart: `id(("circle"))`, `id[["stadium"]]` etc.',
      'Groups: `block:name` ... `end` (with own `columns`). Widths: `id:2` spans columns; `space` / `space:2` gaps.',
      'Edges: `A --> B`, `A -- "label" --> B`, styles via `style`/`classDef`.',
    ],
    example: `block-beta
    columns 3
      front["Frontend"] api["API"] db[("DB")]
      front --> api --> db`,
    pitfalls: [
      'Blocks need spaces between them (`A B`, not `AB`).',
      'Use `-->`/`---`, not `-` alone, for links.',
    ],
  },
  packet: {
    keyword: 'packet',
    title: 'Packet diagram',
    whenToUse: 'Network packet / register bit layouts.',
    rules: [
      'Start with `packet` (older `packet-beta` still works). Each line: `start-end: "Field"` with lowest bit first (`0-7`, never `7-0`).',
      'Shorthand: `+8: "Field"` continues from the previous end; `0: "Flag"` for single bits.',
      'Options: `bitOrder: descending` mirrors rows for register convention; bitsPerRow default 32.',
    ],
    example: `packet
    0-3: "Version"
    4-7: "IHL"
    8-15: "DSCP"
    16-31: "Total Length"`,
    pitfalls: [
      'Declare ranges lowest-bit-first; reversed ranges fail.',
      'Field labels must be quoted.',
    ],
  },
  kanban: {
    keyword: 'kanban',
    title: 'Kanban board',
    whenToUse: 'Workflow boards: todo/doing/done with assignees and tickets.',
    rules: [
      'Start with `kanban`. Columns: `todo[Todo]`. Tasks indented under columns: `t1[Write docs]`.',
      'IDs must be unique across the board. Indentation (spaces) assigns tasks to columns.',
      'Metadata: `t1[Docs]@{ assigned: "ana", ticket: 123, priority: "High" }` (priority: Very High/High/Low/Very Low).',
      'Frontmatter `config: kanban: ticketBaseUrl` links ticket numbers (use #TICKET# placeholder).',
    ],
    example: `kanban
    todo[Todo]
        t1[Write docs]@{ assigned: "ana", priority: "High" }
    done[Done]
        t2[Setup repo]`,
    pitfalls: [
      'Tasks must be indented under their column.',
      'IDs must be unique; duplicates break rendering.',
    ],
  },
  architecture: {
    keyword: 'architecture-beta',
    title: 'Architecture diagram',
    whenToUse: 'Cloud/infra topology with icons, groups, and directional edges.',
    rules: [
      'Start with `architecture-beta`. Groups: `group api(cloud)[API]` with optional `in parent`.',
      'Services: `service db(database)[DB]` with optional `in group`. Icons: cloud, database, disk, internet, server (or registered icon packs as `pack:name`).',
      'Edges: `db:R -- L:server`, arrows `db:R --> L:server`, 90-degree `db:T -- L:server`. Group edges: `a{group}:B --> T:b{group}`.',
      'Junctions: `junction j1`. Align: `align row a b` / `align column a b` for sibling layout.',
    ],
    example: `architecture-beta
    group api(cloud)[API]
    service web(server)[Web] in api
    service db(database)[DB] in api
    web:R --> L:db`,
    pitfalls: [
      'Edge sides need the colon form (`R:`), not bare letters.',
      'Members in align directives must already be declared.',
    ],
  },
  radar: {
    keyword: 'radar-beta',
    title: 'Radar chart',
    whenToUse: 'Multi-dimensional comparison: vendor scores, skill profiles, benchmarks.',
    rules: [
      'Start with `radar-beta`. Optional `title`.',
      'Axes: `axis speed["Speed"], cost["Cost"]` (id plus optional label).',
      'Curves: `curve a["Alpha"]{90, 70}` in axis order, or key-value `curve b{ speed: 80, cost: 60 }`.',
      'Options: `showLegend`, `max 100`, `min 0`, `graticule circle|polygon`, `ticks 5`.',
    ],
    example: `radar-beta
    title Vendors
    axis speed["Speed"], cost["Cost"], ux["UX"]
    curve a["Alpha"]{90, 60, 80}
    curve b["Beta"]{70, 85, 65}
    max 100`,
    pitfalls: [
      'Curve value counts must match axis counts (unless key-value form).',
      'Axis IDs referenced by curves must be declared first.',
    ],
  },
  treemap: {
    keyword: 'treemap-beta',
    title: 'Treemap',
    whenToUse: 'Hierarchical proportions: budgets, disk usage, portfolio mix.',
    rules: [
      'Start with `treemap-beta`. Sections: `"Name"` lines; leaves: `"Leaf": 12`.',
      'Hierarchy by indentation (spaces). Sizes scale rectangle areas.',
      'Style nodes with `:::className` plus `classDef`. Values shown by default.',
    ],
    example: `treemap-beta
    "Marketing"
        "Ads": 40
        "Blog": 25
    "Engineering"
        "Infra": 60`,
    pitfalls: [
      'Leaf values must be numbers; negatives render poorly.',
      'Use spaces, not tabs, for hierarchy.',
    ],
  },
  venn: {
    keyword: 'venn-beta',
    title: 'Venn diagram',
    whenToUse: 'Set overlaps: audiences, feature intersections, coverage.',
    rules: [
      'Start with `venn-beta`. Declare sets: `set A`, `set B["Label"]`. Identifiers bare or quoted.',
      'Overlaps: `union A,B ["Both"]`. Union IDs must reference earlier sets; 3+ sets auto-render pairwise overlaps.',
      'Sizes: `set A:10`, `union A,B:5`. Inner labels: indented `text ...` lines.',
      'Style: `style A fill:#f9f,stroke:#333` (fill/color/stroke/stroke-width/fill-opacity). Beta: syntax may evolve.',
    ],
    example: `venn-beta
    set SEO
    set Ads
    union SEO,Ads ["Both"]`,
    pitfalls: [
      'Unions must come after their sets.',
      'Beta keyword `venn-beta` is required (not `venn`).',
    ],
  },
  ishikawa: {
    keyword: 'ishikawa-beta',
    title: 'Ishikawa (fishbone) diagram',
    whenToUse: 'Root-cause analysis: causes branching toward one effect.',
    rules: [
      'Start with `ishikawa-beta`. First line is the effect (problem) at the head.',
      'Causes on following lines; fishbone structure comes from indentation.',
      'Beta: syntax may evolve; keep labels concise.',
    ],
    example: `ishikawa-beta
    Slow checkout
        Frontend
            Heavy bundle
            Render blocking
        Backend
            N+1 queries
            Cold cache`,
    pitfalls: [
      'The first line must be the effect, not a cause.',
      'Indentation defines the bone structure — be consistent.',
    ],
  },
  info: {
    keyword: 'info',
    title: 'Info box',
    whenToUse: 'Showing version/build metadata inside rendered docs.',
    rules: [
      'Single line: `info` then `showInfo` renders version details.',
      'No custom content — it displays Mermaid runtime info.',
    ],
    example: `info
showInfo`,
    pitfalls: ['Not for custom text — use flowchart or mindmap for content.'],
  },
};
