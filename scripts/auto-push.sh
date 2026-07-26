#!/bin/bash
# Sauvegarde automatique du projet : commit + push de toute modification.
# Appelé par un hook Claude Code à la fin de chaque réponse.
#
# Tourne en tâche de fond et ne bloque jamais : si le push échoue (réseau,
# secret détecté par GitHub…), le commit local est quand même fait et l'erreur
# est consignée dans .git/auto-push.log.

REPO="/Users/petersonfrancis/koneksyon-pam"
cd "$REPO" || exit 0

LOG="$REPO/.git/auto-push.log"
LOCK="$REPO/.git/auto-push.lock"

# Un seul push à la fois (mkdir est atomique — flock n'existe pas sur macOS).
mkdir "$LOCK" 2>/dev/null || exit 0
trap 'rmdir "$LOCK" 2>/dev/null' EXIT

# Rien à sauvegarder ?
[ -z "$(git status --porcelain)" ] && exit 0

BRANCH="$(git branch --show-current)"
[ -z "$BRANCH" ] && exit 0   # HEAD détachée : on ne touche à rien

{
  echo "--- $(date '+%Y-%m-%d %H:%M:%S') — branche $BRANCH"

  git add -A
  # Résumé lisible : nombre de fichiers + les principaux noms.
  FILES="$(git diff --cached --name-only | wc -l | tr -d ' ')"
  MAIN="$(git diff --cached --name-only | head -3 | xargs -n1 basename 2>/dev/null | paste -sd', ' -)"
  git commit -q -m "Sauvegarde auto ($FILES fichier(s)) : $MAIN" || { echo "rien à committer"; exit 0; }

  # postBuffer élargi : le dépôt contient des médias (musiques, images).
  if git -c http.postBuffer=524288000 push -q origin "$BRANCH"; then
    echo "✅ poussé sur origin/$BRANCH"
  else
    echo "⚠️  push échoué — le commit local est fait, à pousser à la main"
  fi
} >>"$LOG" 2>&1
