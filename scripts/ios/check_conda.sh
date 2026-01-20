#!/usr/bin/env bash

# Exit non-zero if Conda/Anaconda variables are present in the environment
if [ -n "$CONDA_PREFIX" ] || [ -n "$CONDA_EXE" ] || [ -n "$CONDA_DEFAULT_ENV" ]; then
  echo "⚠️  Conda/Anaconda environment detected. This can contaminate Xcode builds."
  echo "Run 'conda deactivate' or use the clean build wrappers in scripts/ios/"
  exit 1
fi
exit 0
