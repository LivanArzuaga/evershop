export default {
  Setting: {
    isracardDisplayName: (setting) => {
      const isracardDisplayName = setting.find(
        (s) => s.name === 'isracardDisplayName'
      );
      if (isracardDisplayName) {
        return isracardDisplayName.value;
      }
      return 'Isracard';
    }
  }
};
