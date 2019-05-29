$(document).ready(function() {
    $('#createBtn').on('click', function() {
      var $this = $(this);
      var loadingText = '<i class="fas fa-cog fa-spin"></i> Creating Award...';
      if ($(this).html() !== loadingText) {
        $this.data('original-text', $(this).html());
        $this.html(loadingText);
      }
      setTimeout(function() {
        $this.html($this.data('original-text'));
      }, 9000);
    });
  })