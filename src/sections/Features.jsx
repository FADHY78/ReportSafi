import {
  IconGauge,
  IconShield,
  IconHistory,
  IconUpload,
  IconLayers,
  IconEye,
} from '../ui/Icons';

const FEATURES = [
  {
    icon: IconGauge,
    title: 'Live availability, decided by the server',
    text: 'The moment you press confirm, the portal re-checks the register itself. Your browser never gets to decide — so two students cannot walk away with the same title.',
    rule: 'BR-03 / BR-04',
  },
  {
    icon: IconShield,
    title: 'One student, one title',
    text: 'A second reservation is refused politely and clearly, and a title already held cannot be claimed by anyone else. The rule is enforced on every write, not just in the form.',
    rule: 'BR-01 / BR-02',
  },
  {
    icon: IconHistory,
    title: 'Every change leaves a trail',
    text: 'Release a title, edit a wording, import a batch — each action is stamped with who did it, when, and why. Releases cannot be saved without a reason.',
    rule: 'BR-07',
  },
  {
    icon: IconUpload,
    title: 'CSV in, CSV out',
    text: 'Import a whole catalogue from a spreadsheet and see exactly which rows will be rejected before anything is committed. Export selections or the audit log at any time.',
    rule: 'BR-08',
  },
  {
    icon: IconLayers,
    title: 'Scoped to your programme',
    text: 'Students only ever see titles belonging to their own course, and each programme carries a thousand-plus approved titles to choose from.',
    rule: 'BR-06 / BR-09',
  },
  {
    icon: IconEye,
    title: 'Readable by everyone',
    text: 'No status is shown by colour alone — every badge carries a word. The whole flow works from a keyboard, on a phone, and on a slow campus connection.',
    rule: 'PRD §10',
  },
];

export default function Features() {
  return (
    <section className="section" id="features">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">What is inside</span>
          <h2>Built like a system of record, not a signup form</h2>
          <p>
            Title selection goes wrong in small ways: a duplicated reservation, a silent overwrite,
            a change nobody can explain later. Report Safi is designed so those cannot happen.
          </p>
        </div>

        <div className="feature-grid">
          {FEATURES.map((f) => (
            <article className="feature-card" key={f.title}>
              <span className="feature-icon">
                <f.icon size={20} />
              </span>
              <span className="feature-rule">{f.rule}</span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
