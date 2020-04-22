function validate(schema, value){
      if (!(schema.required) && value==='') return; // is this ok? if not required value can always be '' ???
      if (($this->conf['pattern']??0) && !preg_match('/'.$this->conf['pattern'].'/', $value)) return 'Pattern does not match';
      if (($this->conf['required']??0) && $value==='') return 'Required';
      if (($this->conf['maxlength']??0) && strlen($value) > $this->conf['maxlength']) return 'Too long';
      if ($this->conf['type'] === 'email' && !filter_var($value, FILTER_VALIDATE_EMAIL)) return 'Email is not valid';
      if ($this->conf['type'] === 'number') {
          $value = (float)$value;
          if (isset($this->conf['min']) && $value < $this->conf['min']) return 'Too small';
          if (($this->conf['max']??0)   && $value > $this->conf['max']) return 'Too big';
      }
      if ($this->conf['type'] === 'date') {
          if (isset($this->conf['min']) && strtotime($value) < strtotime($this->conf['min'])) return 'Too small';
          if (isset($this->conf['max']) && strtotime($value) < strtotime($this->conf['max'])) return 'Too big';
      }
      if ($this->conf['type'] === 'select') {
          $options = $this->conf['options'];
          $assoc = array_keys($options) !== range(0, count($options) - 1);
          if ($assoc  && !isset($options[$value])) return 'Not in options';
          if (!$assoc && !in_array($value, $options)) return 'Not in options';
      }
}
