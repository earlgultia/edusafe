import { EntryScreen } from '../pages/EntryScreen.jsx';

function SignedOutView({ entryView, entryRole, setEntryView, setEntryRole, signIn }) {
  return (
    <EntryScreen
      view={entryView}
      role={entryRole}
      setRole={setEntryRole}
      setView={setEntryView}
      signIn={signIn}
    />
  );
}

export { SignedOutView };