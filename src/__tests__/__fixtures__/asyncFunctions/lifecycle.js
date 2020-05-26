let state = null;

spectral.on('setup', () => {
  let resolve;
  let reject;
  const request = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  })
    .catch(() => [])

  state = {
    words: [],
    request,
    resolve,
    reject,
  };
});

spectral.on('beforeTeardown', () => {
  if (state.words.length > 0) {
    makeRequest(state.words)
      .then(state.resolve)
      .catch(state.reject);
  } else {
    state.reject();
  }
});

spectral.on('afterTeardown', () => {
  state = null;
});

module.exports = async function (targetVal) {
  if (!state.words.includes(targetVal)) {
    state.words.push(targetVal);
  }

  const dictionary = await state.request;

  if (dictionary.includes(targetVal)) {
    return [{ message: '`' + targetVal + '`' + ' is a forbidden word.' }];
  }
}

async function makeRequest(words) {
 return (await fetch(`https://dictionary.com/evil?words=${words.join(',')}`)).json();
}

