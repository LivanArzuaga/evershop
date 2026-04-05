export default {
  Setting: {
    mercadopagoDisplayName: (setting) => {
      const mercadopagoDisplayName = setting.find(
        (s) => s.name === 'mercadopagoDisplayName'
      );
      if (mercadopagoDisplayName) {
        return mercadopagoDisplayName.value;
      }
      return 'Mercado Pago';
    }
  }
};
