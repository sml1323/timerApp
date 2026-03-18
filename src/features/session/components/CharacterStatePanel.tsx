import defaultSvg from '../../../assets/characters/default.svg';
import loadingSvg from '../../../assets/characters/loading.svg';
import speakSvg from '../../../assets/characters/speak.svg';
import styles from './CharacterStatePanel.module.css';

type CharacterState = 'default' | 'loading' | 'speak';

interface CharacterStatePanelProps {
  state: CharacterState;
  message?: string;
}

const CHARACTER_MAP: Record<CharacterState, string> = {
  default: defaultSvg,
  loading: loadingSvg,
  speak: speakSvg,
};

const DEFAULT_MESSAGES: Record<CharacterState, string> = {
  default: '',
  loading: '집중 진행 중',
  speak: '',
};

export function CharacterStatePanel({ state, message }: CharacterStatePanelProps) {
  const src = CHARACTER_MAP[state];
  const displayMessage = message ?? DEFAULT_MESSAGES[state];

  return (
    <div className={styles.panel}>
      <img
        className={styles.characterImage}
        src={src}
        alt=""
        aria-hidden="true"
      />
      {displayMessage && (
        <p className={styles.message}>{displayMessage}</p>
      )}
    </div>
  );
}
