import idiom from 'idiom.js';

const lang = idiom({
    'default': {
        'welcome': 'Hybridation'
    },
    'pt-PT': {
        'welcome': 'Hybridation'
    }
});

export default lang(window.navigator.language);
